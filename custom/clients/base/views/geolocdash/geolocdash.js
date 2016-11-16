/**
	@Author: Jawad Humayun
	email: 1987jawad@gmail.com
*/
({
    plugins: ['Dashlet'],
	GeoLocFields: {},
	selected_field: {},
	message_id: 'geoLocDashMessage',
	defaults: 	{	
					latitude:'31.521307428542418',
					longitude:'74.3477600812912',
					zoom:'20'
				},
	latitude: {},
    longitude: {},
    zoom: {},
	
	mapOptions: {},
	mapObj: {},
	mapClickListener: {},
	mapZoomListener: {},

    initDashlet: function() {
		var self = this;
        		
		if(!_.isUndefined(this.model)){
			$.each(this.model.fields, function(idx,field){
				if(field.type=="Geoloc"){
					self.GeoLocFields[idx]=field;
				}
			});
		}
		if(_.isEmpty(this.GeoLocFields)) {
			app.alert.show(this.message_id, {
				level: 'error ',
				messages: app.lang.getAppString('LBL_DASHLET_MODULE_MISSING_GEOLOC'),
				autoClose: false
			});
		}
    },

    loadData: function (options) {
        var self = this;
		
        if(_.isUndefined(this.model)){
            return;
        }
		
    },
	
	_render: function () {
        this._super('_render');
		this.afterRender();
    },
	
	afterRender: function(){
		var self = this;
		self.populateFieldSelector();
		self.fillDashletVars();
		self.setMapCenter(this.defaults.latitude,this.defaults.longitude,this.defaults.zoom);
		
		self.disableCopy();
		$('button#copy_values').click(function(){
			if(self.isFieldSelected()){
				self.model.set(self.latitude.name,$('#DASHLET_LATITUDE').text());
				self.model.set(self.longitude.name,$('#DASHLET_LONGITUDE').text());
				self.model.set(self.zoom.name,$('#DASHLET_ZOOM').text());
				$('span[data-name="'+self.selected_field.name+'"]').trigger('click');
			}
			self.disableCopy();
		});
	},
	
	populateFieldSelector: function(){
		var self = this;
		$('select#geoloc_selected').append('<option value="">None</option>');
		$.each(this.GeoLocFields, function(idx,field){
			$('select#geoloc_selected').append('<option value="'+field.name+'">'+app.lang.get(field.label,self.model.get('_module'))+'</option>');
		});
		
		/*bind onchange event*/
		$('select#geoloc_selected').change(function(){
			self.selected_field.name = $( this ).val();
			/*if some field is selected*/
			if(self.selected_field.name!==""){
				self.latitude.name = self.selected_field.name+'_latitude';
				self.longitude.name = self.selected_field.name+'_longitude';
				self.zoom.name = self.selected_field.name+'_zoom';
				self.fillDashletVars();
				var lati = self.model.get(self.latitude.name);
				var longi = self.model.get(self.longitude.name);
				var zoom = self.model.get(self.zoom.name);
				self.setMapCenter(lati,longi,zoom);
			}
			else{
				self.latitude = {};
				self.longitude = {};
				self.zoom = {};
				self.disableCopy();
			}
		});
	},
	
	setMapCenter: function(lati,longi,zoom_val){
		var self = this;
		this.mapOptions = {
			center: new google.maps.LatLng(parseFloat(lati), parseFloat(longi)),
			zoom: parseInt(zoom_val,10),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var infoWindow = new google.maps.InfoWindow();
		var latlngbounds = new google.maps.LatLngBounds();
				
		if($('#dvMap').length){
			this.mapObj = new google.maps.Map(document.getElementById("dvMap"), this.mapOptions);
			
			/*Remove provious listener if exists*/
			if(!_.isEmpty(this.mapClickListener)){
				google.maps.event.removeListener(this.mapClickListener);
			}
			
			if(!_.isEmpty(this.mapZoomListener)){
				google.maps.event.removeListener(this.mapZoomListener);
			}
			
			/*Add new listeners*/
			this.mapClickListener = google.maps.event.addListener(this.mapObj, 'click', function (e) {
				$('#DASHLET_LATITUDE').html(e.latLng.lat());
				$('#DASHLET_LONGITUDE').html(e.latLng.lng());
				if(self.isFieldSelected()){
					self.enableCopy();
				}
			});
			
			this.mapZoomListener = google.maps.event.addListener(this.mapObj, 'zoom_changed', function (e) {
				$('#DASHLET_ZOOM').html(self.mapObj.getZoom());
				if(self.isFieldSelected()){
					self.enableCopy();
				}
			});
		}
	},
	
	fillDashletVars: function(){
		var self = this;
		if(!this.isFieldSelected()){
			$('#DASHLET_LATITUDE').html(this.defaults.latitude);
			$('#DASHLET_LONGITUDE').html(this.defaults.longitude);
			$('#DASHLET_ZOOM').html(this.defaults.zoom);
		}
		else{
			$('#DASHLET_LATITUDE').html(this.model.get(this.latitude.name));
			$('#DASHLET_LONGITUDE').html(this.model.get(this.longitude.name));
			$('#DASHLET_ZOOM').html(this.model.get(this.zoom.name));
		}
	},
	
	isFieldSelected: function(){
		if(_.isEmpty(this.selected_field) || this.selected_field.name==""){
			$('#dvMap').hide();
			return false;
		}
		else{
			$('#dvMap').show();
			return true;
		}
	},
	
	enableCopy: function(){
		$('button#copy_values').prop('disabled', false);
	},
	
	disableCopy: function(){
		$('button#copy_values').prop('disabled', true);
	},
})