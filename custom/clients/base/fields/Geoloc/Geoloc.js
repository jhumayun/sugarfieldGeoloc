/**
	@Author: Jawad Humayun
	email: 1987jawad@gmail.com
*/
({
    latitude: {},
    longitude: {},
    zoom: {},
	composite_val: {},
    /**
     * Called when initializing the field
     * @param options
     */
    initialize: function (options) {
        this._super('initialize', [options]);
        this.latitude = {
            name: this.name + "_latitude",
            type: "varchar",
        };
        this.longitude = {
            name: this.name + "_longitude",
            type: "varchar",
        };
        this.zoom = {
            name: this.name + "_zoom",
            type: "varchar",
        };
		if (_.isEmpty(this.model.get(this.def.name)))
        {
			this.composite_val = '{"latitude":"18.9300","longitude":"72.8200","zoom":"14"}';
		}
		else{
			this.composite_val = this.model.get(this.def.name);
		}
		
    },
    /**
     * Called when rendering the field
     * @private
     */
    _render: function () {
        this._super('_render');
        this._populateValueToModel();
        this.renderInnerFields();
		/*this.makeInputsReadonly();
		this.map_listener();*/
    },
	
	makeInputsReadonly: function() {
		$('input[name='+this.latitude.name+']').prop( "disabled", true );
		$('input[name='+this.longitude.name+']').prop( "disabled", true );
		$('input[name='+this.zoom.name+']').prop( "disabled", true );
	},
	
	map_listener: function () {
		var self = this;
		var lati = parseFloat(this.model.get(this.latitude.name));
		var longi = parseFloat(this.model.get(this.longitude.name));
		var zoom_val = parseInt(this.model.get(this.zoom.name),10);
		var mapOptions = {
			center: new google.maps.LatLng(lati, longi),
			zoom: zoom_val,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var infoWindow = new google.maps.InfoWindow();
		var latlngbounds = new google.maps.LatLngBounds();
		if($('#dvMap').length){
			var map = new google.maps.Map(document.getElementById("dvMap"), mapOptions);
		
			google.maps.event.addListener(map, 'click', function (e) {			
				self.model.set(self.latitude.name, e.latLng.lat());
				self.model.set(self.longitude.name, e.latLng.lng());
			});
			
			google.maps.event.addListener(map, 'zoom_changed', function (e) {
				self.model.set(self.zoom.name, map.getZoom());
			});
		}
		
	},
	
    /**
     * Called when formatting the value for display
     * @param value
     */
    format: function (value) {
        return this._super('format', [value]);
    },
    /**
     * Render inner fields by getting their sfuuid.
     */
    renderInnerFields: function () {
        var self = this;
        self.viewFields = {};
        $('#' + this.name + ' span[sfuuid]').each(function () {
            var $this = $(this),
                    sfId = $this.attr('sfuuid');
            var field = self.view.fields[sfId];
            field.setElement($this || self.$("span[sfuuid='" + sfId + "']"));
            self.viewFields[field.name] = field;
            try {
                field.render();
            } catch (e) {
                // app.logger.error("Failed to render " + field + " on " + this + "\n" + e);
                // app.error.handleRenderError(this, '_renderField', field);
            }
        });
    },
    bindDataChange: function () {
        this.model.on('change:' + this.latitude.name, this._updateJson, this);
        this.model.on('change:' + this.longitude.name, this._updateJson, this);
        this.model.on('change:' + this.zoom.name, this._updateJson, this);

        this._super('bindDataChange');
    },
    _updateJson: function () {
		
        var resultantJson = {};
		
        var val = this.model.get(this.latitude.name);
        resultantJson['latitude'] = val;
		
        var val = this.model.get(this.longitude.name);
        resultantJson['longitude'] = val;

        var val = this.model.get(this.zoom.name);
        resultantJson['zoom'] = val;

		this.composite_val = JSON.stringify(resultantJson);
		
		this.makeInputsReadonly();
    },
    _populateValueToModel: function ()
    {
        var fieldValue = this.composite_val;
		/* console.log('_populateValueToModel fieldValue');
		console.log(fieldValue);
		console.log('_populateValueToModel this.model');
		console.log(this.model); */
        if (!_.isEmpty(fieldValue))
        {
            fieldValue = JSON.parse(fieldValue);
        }

        if (fieldValue)
        {
            this.model.set(this.latitude.name, fieldValue['latitude']);
            this.model.set(this.longitude.name, fieldValue['longitude']);
            this.model.set(this.zoom.name, fieldValue['zoom']);
        }
        else
        {
            this.model.set(this.latitude.name, '');
            this.model.set(this.longitude.name, '');
            this.model.set(this.zoom.name, '');
        }
		this.model.set(this.def.name, this.composite_val);
    }

})