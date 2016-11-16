<?php

$js_groupings[] = $newGrouping = array(
    'custom/include/javascript/googlemapsapi/googlemapsapi.js' => 'include/javascript/googlemapsapi.js',
);

foreach ($js_groupings as $key => $groupings)
{
    foreach  ($groupings as $file => $target)
    {
    	//if the target grouping is found
        if ($target == 'include/javascript/sugar_grp7.min.js')
        {
            //append the custom JavaScript file
            $js_groupings[$key]['custom/include/javascript/googlemapsapi/googlemapsapi.js'] = 'include/javascript/sugar_grp7.min.js';
        }
        break;
    }
}