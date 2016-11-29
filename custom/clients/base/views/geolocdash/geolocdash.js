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
					latitude:'23.644524198573688',
					longitude:'-102.65419006347656',
					zoom:'6'
				},
	latitude: {},
    longitude: {},
    zoom: {},
	
	mapOptions: {},
	mapObj: {},
	mapClickListener: {},
	mapZoomListener: {},
	mapSearchBox: {},
	mapPlaceChngListener: {},

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
				level: 'error',
				messages: app.lang.getAppString('LBL_DASHLET_MODULE_MISSING_GEOLOC'),
				autoClose: false
			});
		}
    },
	
	addJavascript: function(src,id){
		if($('#'+id).length==0){
			var js_file = document.createElement('script');
			js_file.type = 'text/javascript';
			js_file.src = src;
			js_file.id = id;
			document.getElementsByTagName('head')[0].appendChild(js_file);
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
		/* self.fillDashletVars();
		self.setMapCenter(this.defaults.latitude,this.defaults.longitude,this.defaults.zoom); */
		
		var chkInterval = setInterval(function () {
		  app.alert.show(self.message_id, {
				level: 'info',
				messages: 'Waiting for google API to load....',
				autoClose: false
			});
		  if (typeof google == 'object') {
			clearInterval(chkInterval);
			// processing code
			app.alert.show(self.message_id, {
				level: 'success',
				messages: 'Google API Loaded!',
				autoClose: true
			});
			self.postApiLoadRender();
		  }
		}, 3000);
		
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
	
	postApiLoadRender: function(){
		var self = this;
		var lati = null;
		var longi = null;
		var zoom = null;
		
		var map_centered_flg = false;
		
		self.latitude.name = self.selected_field.name+'_latitude';
		self.longitude.name = self.selected_field.name+'_longitude';
		self.zoom.name = self.selected_field.name+'_zoom';
		
		if( _.isEmpty(this.model.get('billing_address_street')) && _.isEmpty(this.model.get('billing_address_city')) && _.isEmpty(this.model.get('billing_address_state')) && _.isEmpty(this.model.get('billing_address_country')) ){
			lati = self.model.get(self.latitude.name);
			longi = self.model.get(self.longitude.name);
			zoom = self.model.get(self.zoom.name);
			self.setMapCenter(lati,longi,zoom);
			self.fillDashletVars();
		}
		else{
			var geocoder = new google.maps.Geocoder();
			var address = this.model.get('billing_address_street')+', '+this.model.get('billing_address_city')+', '+this.model.get('billing_address_state')+', '+this.model.get('billing_address_country');
						
			geocoder.geocode( { 'address': address}, function(results, status) {
			  if (status == google.maps.GeocoderStatus.OK) {
				var latitude = results[0].geometry.location.lat();
				var longitude = results[0].geometry.location.lng();
				self.mapObj = new google.maps.Map(document.getElementById("dvMap"), {
												  center: {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()},
												  zoom: 21,
												  mapTypeId: google.maps.MapTypeId.ROADMAP
												});
				
				self.mapObj.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: self.mapObj,
					position: results[0].geometry.location
				});
				if (results[0].geometry.viewport){
					self.mapObj.fitBounds(results[0].geometry.viewport);
					map_centered_flg = true;
				}
				
				if(_.isEmpty(self.model.get(self.selected_field.name+'_latitude')) || _.isEmpty(self.model.get(self.selected_field.name+'_longitude')) || _.isEmpty(self.model.get(self.selected_field.name+'_zoom'))){
					lati = latitude;
					longi = longitude;
					zoom = parseInt(self.mapObj.getZoom(),10);
				}
				else{
					lati = self.model.get(self.latitude.name);
					longi = self.model.get(self.longitude.name);
					zoom = self.model.get(self.zoom.name);
				}
				
				if(!map_centered_flg){
					self.setMapCenter(lati,longi,zoom);
				}
				else{
					self.searchBoxActivate();
				}
				self.fillDashletVars();
				self.enableCopy();
			  } 
			});
		}
		
		 
	},
	
	populateFieldSelector: function(){
		var self = this;
		$('select#geoloc_selected').append('<option value="">None</option>');
		var i=1;
		var sel="";
		$.each(this.GeoLocFields, function(idx,field){
			if(i==1){
				sel='selected="selected"';
				self.selected_field.name = field.name;
			}
			else{
				sel="";
			}
			$('select#geoloc_selected').append('<option '+sel+' value="'+field.name+'">'+app.lang.get(field.label,self.model.get('_module'))+'</option>');
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
		
		var chkInterval = setInterval(function () {
		  app.alert.show(self.message_id, {
				level: 'info',
				messages: 'Waiting for google API to load....',
				autoClose: false
			});
		  if (typeof google == 'object') {
			clearInterval(chkInterval);
			// processing code
			app.alert.show(self.message_id, {
				level: 'success',
				messages: 'Google API Loaded!',
				autoClose: true
			});
			self.postApiLoad(lati,longi,zoom_val);
		  }
		}, 3000);
		
	},
	
	postApiLoad: function (lati,longi,zoom_val){
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
				self.setDashLatLng();
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
			
			self.searchBoxActivate();
			
		}
	},
	
	searchBoxActivate: function(){
		var self = this;
		
		if(!_.isEmpty(this.mapPlaceChngListener)){
			google.maps.event.removeListener(this.mapPlaceChngListener);
		}
		if($('#pac-input').length){
			// Create the search box and link it to the UI element.
			var input = document.getElementById('pac-input');
			this.mapSearchBox = new google.maps.places.SearchBox(input);
			this.mapObj.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

			// Bias the SearchBox results towards current map's viewport.
			this.mapObj.addListener('bounds_changed', function() {
			  self.mapSearchBox.setBounds(self.mapObj.getBounds());
			  self.setDashLatLng();
			});
			
			var markers = [];
			// Listen for the event fired when the user selects a prediction and retrieve
			// more details for that place.
			this.mapPlaceChngListener = self.mapSearchBox.addListener('places_changed', function() {
			  var places = self.mapSearchBox.getPlaces();

			  if (places.length == 0) {
				return;
			  }

			  // Clear out the old markers.
			  markers.forEach(function(marker) {
				marker.setMap(null);
			  });
			  markers = [];

			  // For each place, get the icon, name and location.
			  var bounds = new google.maps.LatLngBounds();
			  places.forEach(function(place) {
				if (!place.geometry) {
				  console.log("Returned place contains no geometry");
				  return;
				}
				var icon = {
				  url: place.icon,
				  size: new google.maps.Size(71, 71),
				  origin: new google.maps.Point(0, 0),
				  anchor: new google.maps.Point(17, 34),
				  scaledSize: new google.maps.Size(25, 25)
				};

				// Create a marker for each place.
				markers.push(new google.maps.Marker({
				  map: self.mapObj,
				  icon: icon,
				  title: place.name,
				  position: place.geometry.location
				}));

				if (place.geometry.viewport) {
				  // Only geocodes have viewport.
				  bounds.union(place.geometry.viewport);
				} else {
				  bounds.extend(place.geometry.location);
				}
			  });
			  self.mapObj.fitBounds(bounds);
			});
			
		}
	},
	
	setDashLatLng: function(){
		$('#DASHLET_LATITUDE').html(this.mapObj.center.lat());
		$('#DASHLET_LONGITUDE').html(this.mapObj.center.lng());
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