/*
 * Declarations used in multiple files ()
 */

import { app } from 'electron';
import { factory } from 'electron-json-config';
import * as deepmerge from 'deepmerge';
import * as fs from 'fs';
import * as path from 'path';
import { packageJson, Person } from './global';

/**
 * Guesses whenever application is packaged (in *ASAR* format).
 * 
 * This function is used to block some broken or untested features that
 * needs to be improved before releasing. To test these features, you have to run
 * app from the sources with `npm start` command.
 */
export function guessDevel ():{ devel:boolean, devFlag:string, appIconDir:string } {
	let devel:boolean, devFlag:string, appIconDir:string;
	if (app.getAppPath().indexOf(".asar") < 0) {
		devel = true;
		devFlag = " [DEV]";
		appIconDir = app.getAppPath() + "/sources/assets/icons";
	} else {
		devel = false;
		devFlag = "";
		appIconDir = path.join(app.getAppPath(), "..");
	}
	return { devel:devel, devFlag:devFlag, appIconDir:appIconDir }
}

function person2string(person:Person):string {
	if(person.name)
		return person.name
	return person
}

/** Basic application details. */
export const appInfo = {
	/** Application repository details */
    repository: {
		/** Repository indentifier in format `author/name`. */
		name: person2string(packageJson.author)+'/'+app.getName(),
		/** Web service on which app repository is published. */
		provider: 'github.com'
	},
    icon: guessDevel().appIconDir + "/app.png",
    trayIcon: app.getAppPath() + "/sources/assets/icons/tray.png",
    trayPing: app.getAppPath() + "/sources/assets/icons/tray-ping.png",
    rootURL: 'https://discord.com',
    URL: 'https://watchanimeattheoffice.com/app',
    minWinHeight: 412,
    minWinWidth: 312
}

function isJson (string:string) {
	try {
		JSON.parse(string);
	} catch {
		return false
	}
	return true
}

// Check configuration files for errors

const configs:Array<string> = [
	app.getPath('userData')+"/config.json",
	app.getPath('userData')+"/windowState.json"
]

for (const file of configs) {
	if(fs.existsSync(file)) {
		const stringOfFile = fs.readFileSync(file).toString()
		if(!isJson(stringOfFile)) {
			fs.rmSync(file);
			console.warn("[WARN] Removed '"+path.basename(file)+"' due to syntax errors.")
		}
	}
}

// Export app configuration files

/** An object used to return current app configuration. */
export const appConfig = factory(configs[0]);
/** Contains functions to return and save current window position and state. */
export const winStorage = factory(configs[1]);

// JSON Objects:
export const configData = deepmerge({
	hideMenuBar: false,
	mobileMode: false,
	disableTray: false,
	devel: false,
	csp: {
		disabled: false,
		thirdparty: {
			spotify: false,
			gif: false,
			hcaptcha: false,
			youtube: false,
			twitter: false,
			twich: false,
			streamable: false,
			vimeo: false,
			soundcloud: false,
			paypal: false,
			audius: false
		}
	}
}, appConfig.all())

export function getDevel(dev:boolean,conf:boolean):boolean {
	if(dev) {
		return dev;
	} else {
		return conf;
	}
}