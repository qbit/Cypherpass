
// Gets all saved options
// stored in chrome.storage.
function get_saved(callback) {
	chrome.storage.sync.get(
			//Key:value pair. Saved will overwrite preset value.
			get_defaults(),
			//callback
					function (items) {
						//callback or return
						if (typeof callback === 'function') {
							callback(items);
						} else {
							return items;
						}
					});
		}


// Save all options
// stored in chrome.storage.
function save_settings(items, callback) {

//If undefined value, setting will not be saved.
	chrome.storage.sync.set({
		privateKey: items.privateKey,
		publicKey: items.publicKey,
		autofill: items.autofill,
		autologin: items.autologin,
	}, function () {
		//callback or return
		if (typeof callback === 'function') {
			callback(items);
		} else {
			return items;
		}
	});

}

//Get key:value array of all of our names variables
//value is default values.
function get_defaults(items) {

	//array of initial settings
	presets = {
		privateKey: false,
		publicKey: false,
		autofill: true,
		autologin: true
	};

	return presets;
//TODO
//Check against items to see which have already been set.
//
//	var i;
//
//	for (i = 0; i < presets.length; i++) {
//		if (){
//
//		}
//	}
//
//	return items;
}




