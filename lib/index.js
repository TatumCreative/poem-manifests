var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var load = function( manifests, getGraph, emitter ) {
	
	return function( newSlug ) {

		var oldSlug = this.slug;

		var newManifest = manifests[newSlug];
		var oldManifest = this.manifest;
		
		if( !_.isObject( newManifest ) ) {
			return false;
		}

		if( this.slug ) {
			emitter.emit("unload", {
				slug : oldSlug,
				manifest : oldManifest
			});
		}
		
		var graph = parseManifest( newManifest, getGraph() );

		this.manifest = newManifest;
		this.slug = newSlug;
		
		emitter.emit("load", {
			slug		: newSlug,
			manifest	: newManifest,
			graph		: graph
		});
		
		return true;
		
	};
	
};

var parseManifest = function( manifest, graph ) {
	
	_.each( manifest.objects, function loadComponent( value, key ) {
		
		var properties;
		
		if(_.isObject( value )) {
			
			properties = _.isObject( value.properties ) ? value.properties : {};
			
			if( _.isObject( value.function ) ) {
				graph[ key ] = value.function( this, properties );
			} else if( _.isObject( value.construct ) ) {
				graph[ key ] = new value.construct( this, properties );
			} else {
				graph[ key ] = value;
			}
			
		} else {
			graph[ key ] = value;
		}
		
	});
	
	return graph;
};

var createBlankObject = function() { return {}; };

module.exports = function( manifests, properties ) {
	
	var config = _.extend({
		getGraph: createBlankObject,
		emitter: new EventEmitter()
	}, properties);
	
	var state = Object.preventExtensions({
		slug : null,
		manifest : null
	});
	
	return {
		load : load( manifests, config.getGraph, config.emitter ).bind( state ),
		emitter : config.emitter
	}
	
};