'use strict';

import { registerCustomEvent } from './dom';
import features from './features';
import * as KEYMAP from './keyConstants';

const REGEX_EVENT = /^(key+(down|up|press)):((,?[a-z])+)/;

/**
 * Returns the relative keyCode from each key name in an array.
 * @param {Array<string>} keyNames An array with the key names.
 */
function convertKeynamesToKeyCode_(keyNames) {
  return keyNames.map(keyName => {
    return KEYMAP[keyName.toUpperCase()];
  });
}

/**
 * Creates an event configuration object to deail with keyboard events.
 * @param {!Array} MatchedRegexInfo The information extracted from the regex
 * that has matched with the parameterized event name.
 * @param {object} The custom keyboard event configuration that has all the
 * necessary informations for the handler function.
 */
function createCustomKeyboardEventConfig(MatchedRegexInfo) {
  return {
    event: true,
    delegate: true,
    keys: convertKeynamesToKeyCode_(MatchedRegexInfo[3].split(',')),
    handler: handlerKeys,
    originalEvent: MatchedRegexInfo[1]
  }
}

/**
 * Original listener wrapper. It checks if the pressed key matchs with the given
 * keys and it trigger the original listener function.
 * @param {!function(!Object)} callback The original listener that will called
 * when the event is triggered and if the pressed key and the given keys alias
 * matches.
 * @param {event} Event object.
 */
function handlerKeys(callback, event) {
  if (this.keys.indexOf(event.keyCode) > -1) {
    callback(event);
  }
}

var mouseEventMap = {
	mouseenter: 'mouseover',
	mouseleave: 'mouseout',
	pointerenter: 'pointerover',
	pointerleave: 'pointerout'
};
Object.keys(mouseEventMap).forEach(function(eventName) {
	registerCustomEvent(eventName, {
		delegate: true,
		handler: function(callback, event) {
			var related = event.relatedTarget;
			var target = event.delegateTarget;
			if (!related || (related !== target && !target.contains(related))) {
				event.customType = eventName;
				return callback(event);
			}
		},
		originalEvent: mouseEventMap[eventName]
	});
});

var animationEventMap = {
	animation: 'animationend',
	transition: 'transitionend'
};
Object.keys(animationEventMap).forEach(function(eventType) {
	var eventName = animationEventMap[eventType];
	registerCustomEvent(eventName, {
		event: true,
		delegate: true,
		handler: function(callback, event) {
			event.customType = eventName;
			return callback(event);
		},
		originalEvent: features.checkAnimationEventName()[eventType]
	});
});

registerCustomEvent(REGEX_EVENT, createCustomKeyboardEventConfig);
