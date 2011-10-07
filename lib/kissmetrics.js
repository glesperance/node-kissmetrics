var request                 = require('request')
  , async                   = require('async')
  ;

var config                  = require('../config')
  , DEFAULT_TRACKER_SERVER  = config.DEFAULT_TRACKER_SERVER
  , DEFAULT_TRACKER_PORT    = config.DEFAULT_TRACKER_PORT
  ;

/******************************************************************************
 * Performs the given request on the KISSmetrics tracker host.
 * 
 * @param pathname {String} The path section of the URL, that comes after the 
 * host and before the query, including the initial slash if present.
 * 
 * @param query_params {Object}
 * 
 * @param callback {Function} A callback of the form `function(res)`.
 * 
 */
function request_kissmetrics_client(pathname, query_params, callback) {
 
  var query_string  = ''
    , uri
    , v
    ;
  
  query_params['_k'] = this.key;
  
  query_params['_t'] = (query_params['_d'] ? query_params['_t'] : Date.now());
  
  for(var k in query_params) {
    
    v = query_params[k];
    
    if (query_string !== '') {
      query_string += '&';
    }
    
    query_string += [k, v].join('=');
    
  }
  
  uri = encodeURI(['http', ':', '//', this.host, ':', this.port, pathname, '?', query_string].join(''));
  
  request({ uri: uri }, function (err, res) {
    
    if (err) { 
      console.log('KISSmetrics error ---> ', err.message); 
    } else if (res.statusCode !== 200) {
      err = new Error('KISSmetrics error ---> RECEIVED WRONG STATUS CODE [' + res.statusCode + ']'); 
    }
    
    callback(err, res);
  
  });

}

kissmetrics_client.prototype.request = request_kissmetrics_client;

/******************************************************************************
 * Sets properties on a person without recording an event by making a request.
 * 
 * @param person {String} The identity of the person. 
 * 
 * This is limited to 255 chars and all commas (,), and colons (:) will 
 * automatically be changed to spaces (KISSmetrics will convert foo:bar,baz to 
 * foo bar baz).
 *
 * @param properties {Object} An object containing the properties to be set on 
 * `person`.
 * 
 * @param callback {Function} A function of the form `function(err)`.
 * 
 */
function set_kissmetrics_client(person, properties, callback) {
  
  var query_params = new Object(properties)
    ;
  
  query_params['_p'] = person;
  
  this.request('/s', query_params, callback);
  
}

kissmetrics_client.prototype.set        = set_kissmetrics_client;
kissmetrics_client.prototype.properties = set_kissmetrics_client;

/******************************************************************************
 * Aliases the user identified by `person` with `aliases`. 
 * 
 * @param person {String} The identity of the person. 
 * 
 * This is limited to 255 chars and all commas (,), and colons (:) will 
 * automatically be changed to spaces (KISSmetrics will convert foo:bar,baz to 
 * foo bar baz).
 * 
 * @param alias | aliases {String|Array} The alias to apply to the person.
 * 
 * This is limited to 255 chars and all commas (,), and colons (:) will 
 * automatically be changed to spaces (KISSmetrics will convert foo:bar,baz to 
 * foo bar baz).
 * 
 * Can either be a string or an array of string if multiple alias are supplied.
 * 
 * @param callback {Function} A callback of the form `function(err)`.
 * 
 */
function alias_kissmetrics_client(person, aliases, callback) {
  
  var aliases = (Array.isArray(aliases) ? aliases : [aliases])
    , that    = this
    ;

  async.forEach(
      
      aliases
    
    , function(alias, callback) {
        
        var query_params  = {}
          ;
        
        query_params['_p'] = person;
        query_params['_n'] = alias;
        
        that.request('/a', query_params, callback);
        
      }
    
    , callback
    
  );
  
}

kissmetrics_client.prototype.alias = alias_kissmetrics_client;

/******************************************************************************
 * Records `event` for `person. Also sets `properties` on the person if 
 * specified.
 * 
 * @param person {String} The identity of the person doing the event. 
 * 
 * This is limited to 255 chars and all commas (,), and colons (:) will 
 * automatically be changed to spaces (KISSmetrics will convert foo:bar,baz to 
 * foo bar baz).
 * 
 * @param event {String} The name of the event you want to record. 
 * 
 * This is limited to 255 chars and all commas (,), and colons (:) will 
 * automatically be changed to spaces (KISSmetrics will convert foo:bar,baz to 
 * foo bar baz).
 * 
 * @param properties {Object} (optional) An object containing the properties to
 * be set on `person`.
 * 
 * @param callback {Function} A function of the form `function(err)`.
 */
function record_kissmetrics_client() {
  
  var args          = Array.prototype.slice.call(arguments)
  
    , callback      = args.pop()
    
    , person        = args.shift()
    , event         = args.shift()
    , properties    = args.shift() || {}
    
    , query_params  = new Object(properties)
    ;

  query_params['_p'] = person;
  query_params['_n'] = event;
  
  this.request('/e', query_params, callback);
  
}

kissmetrics_client.prototype.record = record_kissmetrics_client;
kissmetrics_client.prototype.event  = record_kissmetrics_client;

/******************************************************************************
 * KISSmetrics REST client constructor.
 * 
 * @param options {Object} The options object defining the REST client to 
 * instantiate. Its possible parameters are :
 * 
 *  @param key {String} your KISSmetrics API key.
 *  
 *  @param host {String} (optional) The tracker host to which the client must be
 *  connected to. Defaults to 'trk.kissmetrics.com'
 *  
 *  @param port {Number} (optional) The port of the tracker to connect to.
 *  Defaults to port 80
 *  
 */
function kissmetrics_client(options) {
  
  var options   = options || {}
    ;
    
  this.host = options.host || DEFAULT_TRACKER_SERVER;
  this.port = options.port || DEFAULT_TRACKER_PORT;
  
  this.key  = options.key;

}

module.exports = kissmetrics_client;