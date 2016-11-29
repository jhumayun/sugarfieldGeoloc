<?php

class googleMapsApiKey extends SugarApi
{
    // This function is only called whenever the rest service cache file is deleted.
    // This shoud return an array of arrays that define how different paths map to different functions
    public function registerApiRest() {
        return array(
            'getKey' => array(
                // What type of HTTP request to match against, we support GET/PUT/POST/DELETE
                'reqType' => 'GET',
                // This is the path you are hoping to match, it also accepts wildcards of ? and <module>
                'path' => array('get_google_maps_api_key'),
                // These take elements from the path and use them to populate $args
                'pathVars' => array('', ''),
                // This is the method name in this class that the url maps to
                'method' => 'getKey',
                // The shortHelp is vital, without it you will not see your endpoint in the /help
                'shortHelp' => 'gets google maps api key defined in config_override.php with index google_maps_api_key',
                // The longHelp points to an HTML file and will be there on /help for people to expand and show
                'longHelp' => '',
				'noLoginRequired'	=> true,
            ),
        );
    }
    
    function getKey($api, $args)
    {
        require_once 'modules/Configurator/Configurator.php';

		$configuratorObj = new Configurator();
			
		//Load config
		$configuratorObj->loadConfig();
		
		if(isset($configuratorObj->config['google_maps_api_key'])){
			return $configuratorObj->config['google_maps_api_key'];
		}
		else{
			return 'key_not_found';
		}
		
    }
}