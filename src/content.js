///////////////////
//Default Settings
///////////////////

//Default crypto
var curve = "secp256k1";
var sigalg = "SHA256withECDSA";

//Autofill values
var autofillFeildName = 'public_key';

//Auto login values
var autoLoginFormName = "public_key_login";
var formChallengeName = "challenge";
var signatureInputFeild = "signature";



//Default Values for Variable object
//publicKey
//privateKey
//message
//signed

///////////////////
//Initial startup
///////////////////
//Get saved settings and run rest of Cypherpass
get_saved(function (items) {
	//for testing uncomment.
//	items = {
//		privateKey: false,
//		publicKey: false,
//		autofill: true,
//		autologin: true};

	//Do we have saved settings?
	//If empty, we havn't saved yet.
	//
	//Make sure "items" is initilized first with empty values.
	//running "get_saved" first initilizes empty "items"
	if (!items.privateKey || !items.publicKey) {
		console.log(
				"Unable to retreive key pair.",
				"Generating and saving new key."
				);
		//Generate new keypair and run.
		items = newKeyPair(items, run);
	} else {
		//Settings have been loaded.
		//Run the rest of Cypherpass
		run(items);
	}

});

//Run the plugin options.
function run(items, callback) {
	//Don't auto login if asking for public key.
	if (!autoFill(items)) {
		//perform autologin
		autoLogin(items);
	}
}


//generate new key pair and save the settigns.
function newKeyPair(items, callback) {
	//if items is empty, initialize
	if (!items) {
		items = {};
	}

	//initilize blank keys.
	items.privateKey = "";
	items.publicKey = "";

	//Generate new keys and save them.
	save_settings(generateKeys(items), callback);
}

//generate new key pair.
function generateKeys(items, callback) {
	var ec = new KJUR.crypto.ECDSA({"curve": curve});
	var keypair = ec.generateKeyPairHex();

	//Store key pair to items.
	items.privateKey = keypair.ecprvhex;
	items.publicKey = keypair.ecpubhex;

	//callback or return
	if (typeof callback === 'function') {
		return callback(items);
	} else {
		return items;
	}
}

function autoFill(items) {
	//If the user has disabled autoFill in the settings don't run
	if (!items.autofill === true) {
		return false;
	}

	var inputs = document.getElementsByName(autofillFeildName);
	if (inputs.length === 0) {
		return false;
	} else {
		inputs[0].value = items.publicKey;
		return true;
	}
}


function autoLogin(items) {
	//If the user has disabled autologin in the settings don't run
	if (!items.autologin === true) {
		return false;
	}

	//get the auto login form.
	var form = document.getElementsByName(autoLoginFormName)[0];
	if (form) {

		items.message = form.getAttribute(formChallengeName);
		inputFeild = document.getElementsByName(signatureInputFeild)[0];
		if (items.message && inputFeild) {
			console.log("Challenge: " + items.message);

			items = signMessage(items, function (items) {
				return items;
			});

			console.log("Signed message: " + items.signed);
			inputFeild.value = items.signed + ":" + items.publicKey;
			form.submit();
		}
	}
}


function signMessage(items, callback) {

	try {
		var sig = new KJUR.crypto.Signature({"alg": sigalg});
	} catch (e) {
		//Appear to need to change the content_security_policy thanks to
		//Chrome sandboxing in the options page.
		//The options in the manifest for "unsafe-eval" appears to be needed.
		update_status(e);
	}

	sig.initSign({'ecprvhex': items.privateKey, 'eccurvename': curve});
	sig.updateString(items.message);
	var sigValueHex = sig.sign();
	items.signed = sigValueHex;

	//callback or return
	if (typeof callback === 'function') {
		return callback(items);
	} else {
		return items;
	}
}


function verifyMessage(items) {
	var sig = new KJUR.crypto.Signature({"alg": sigalg, "prov": "cryptojs/jsrsa"});
	sig.initVerifyByPublicKey({'ecpubhex': items.publicKey, 'eccurvename': curve});
	sig.updateString(items.message);
	return sig.verify(items.signed);
}


function verifyKeyPair(items) {
	if (!items.message) {
		//TODO make this a random string.
		items.message = "testMessage";
	}

	return signMessage(items, verifyMessage);
}


function hash(token) {
	// double hash the private key.
	var hasher = new KJUR.crypto.MessageDigest({alg: "sha256", prov: "cryptojs"});
	//first round
	hasher.updateString(token);
	hashed = hasher.digest();
	//second round
	hasher.updateString(hashed);
	hashed = hasher.digest();
}

