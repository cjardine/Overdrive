'use strict';

// import OverdriveError from 'OverdriveError';
// import OverdriveControl from 'OverdriveControl';

class Overdrive {
    /**
     * constructor - creates a new application
     * @param {object} initializationObject
     * @param {string} initializationObject.name
     * @param {string} initializationObject.element
     * @param {function} initializationObject.initializationFunction
     * @param {Array?} initializationObject.modules
     */
    constructor(initializationObject) {
        let tests = {
            name: false,
            element: false,
            initializationFunction: false,
            modules: false,
            pass: false
        };

        this.classes = {};
        this.root = {};
        this.singletons = {};
        this.modules = [];

        if (Overdrive.isNullOrEmpty(window[initializationObject.name])) {
            window[initializationObject.name] = this;
            tests.name = true;
        } else {

        }

        if (Overdrive.isString(initializationObject.element)) {
            this.element = document.querySelector(initializationObject.element);
            if (Overdrive.isElement(this.element)) {
                tests.element = true;
            }
        }

        if (Overdrive.isFunction(initializationObject.initializationFunction)) {
            initializationObject.initializationFunction(this.root, this.element);
            tests.initializationFunction = true;
        }

        if (Overdrive.isArray(initializationObject.modules)) {
            initializationObject.modules.forEach(function (module, index, array) {

            });
        }
    }

    /**
     *
     * @param {object} initializationObject
     * @param {string} initializationObject.name
     * @param {string} initializationObject.elementName
     * @param {string} initializationObject.template
     * @param {function} initializationObject.constructorFunction
     * @param {function} [initializationObject.instantiationFunction]
     */
    control(initializationObject) {
        initializationObject['root'] = this.root;

        if (Overdrive.isString(initializationObject.name)) {
        } else {
            Overdrive.throwError('ControlInitializationFailed', 'During initialization of Overdrive control. No \'name\' defined.');
            return;
        }

        if (Overdrive.isString(initializationObject.elementName)) {
        } else {
            Overdrive.throwError('ControlInitializationFailed', 'During initialization of ' + initializationObject.elementName + '. No \'elementName\' defined.');
            return;
        }

        if (!Overdrive.isNullOrEmpty(this.classes[initializationObject.name])) {
            Overdrive.throwError('ControlInitializationFailed', 'During initialization of ' + initializationObject.name + '. Control already exists.');
            return;
        }

        this.classes[initializationObject.name] = class extends OverdriveControl {
            constructor() {
                super(initializationObject);

            }
        };
        window.customElements.define(initializationObject.elementName, this.classes[initializationObject.name]);
    }

    /**
     *
     * @param initializationObject
     * @param {string} initializationObject.name
     * @param {function} initializationObject.constructorFunction
     */
    singleton(initializationObject) {
        if (Overdrive.isFunction(initializationObject.constructorFunction)) {
            this.singletons[name] = initializationObject.constructorFunction();
        }
    }


    // static onElementRender(elementSelector, callback) {
    //
    //     if () {
    //
    //     }
    // }

    static isObject(testObject) {
        return (Object.prototype.toString.call(testObject) === '[object Object]' && testObject !== null);
    };

    static isString(testObject) {
        return (Object.prototype.toString.call(testObject) === '[object String]');
    };

    static isFunction(testObject) {
        return (Object.prototype.toString.call(testObject) === '[object Function]');
    };

    static isBoolean(testObject) {
        let isBool = false;
        if (Object.prototype.toString.call(testObject) === '[object Boolean]') {
            isBool = true;
        } else {
            if (typeof  testObject === 'string') {
                isBool = (testObject.toLowerCase() === 'true' || testObject.toLowerCase() === 'false');
            }
        }
        return isBool;
    };

    static isArray(testObject) {
        let isArray;
        if (Array.isArray) {
            isArray = Array.isArray(testObject);
        } else {
            isArray = Object.prototype.toString.call(testObject) === '[object Array]';
        }
        return isArray;
    };

    static isNumber(testObject) {
        return (Object.prototype.toString.call(testObject) === '[object Number]');
    };

    static isElement(testObject) {
        let regex = new RegExp(/\[object HTML[A-Za-z]+Element]/);
        let stringElement,
            elementMatches,
            elementPass = false,
            nodeTypePass = false,
            typeofPass = false,
            nodeNamePass = false,
            notNullPass = false,
            pass = false;


        if (typeof HTMLElement === 'object') {
            pass = testObject instanceof HTMLElement;
        } else {
            notNullPass = !Overdrive.isNullOrEmpty(testObject);
            if (notNullPass) {
                typeofPass = typeof testObject === 'object';
                nodeTypePass = testObject.nodeType === 1;
                nodeNamePass = typeof testObject.nodeName === 'string';
                stringElement = testObject.toString();
                elementMatches = stringElement.match(regex);
                elementPass = (elementMatches.index === 0 && elementMatches.length === 1);
            }
            pass = (notNullPass && typeofPass && nodeTypePass && nodeNamePass);
            console.log('stringElement: ' + stringElement);
            console.log('Element test = ' + (pass === elementPass) + '; Pass: ' + pass + '; Element Pass: ' + elementPass);
        }
        return pass;
    };

    static parseBool(testObject) {
        let ret = false;
        if (typeof testObject === 'boolean') {
            ret = testObject;
        } else {
            if (typeof  testObject === 'string') {
                switch (testObject.toLowerCase()) {
                    case 'true':
                        ret = true;
                        break;
                    case 'false':
                        ret = false;
                        break;
                    default:
                        break;
                }
            }
            if (!isNaN(testObject)) {
                if (testObject === 1) {
                    ret = true;
                } else if (testObject === 0) {
                    ret = false;
                }
            }
        }
        return ret;
    };

    /**
     * getKeyCode
     * @param {KeyboardEvent} e
     * @returns {*}
     */
    static getKeyCode(e) {
        if (e.char) {
            return e.char;
        } else if (e.charCode) {
            return e.charCode;
        } else if (e.which) {
            return e.which;
        } else {
            return null;
        }
    };

    /**
     * isNullOrEmpty
     * @param value
     * @returns {boolean}
     */
    static isNullOrEmpty(value) {
        let ret = false;
        if (Object.prototype.toString.call(value) === '[object Undefined]' ||
            Object.prototype.toString.call(value) === '[object Null]' ||
            value === '') {
            ret = true;
        }
        return ret;
    };

    /**
     * isObjectEmpty
     * @param obj
     * @returns {boolean}
     */
    static isObjectEmpty(obj) {
        let hasOwnProperty = Object.prototype.hasOwnProperty;
        // null and undefined are 'empty'
        if (obj === null || obj === undefined) {
            return true;
        }

        // Is this object an array? If so:
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (Overdrive.isArray(obj) && obj.length) {
            if (obj.length > 0) {
                return false;
            }
            if (obj.length === 0) {
                return true;
            }
        }
        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (let key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }

        return true;
    };

    /**
     * 
     * @param {Node} node 
     * @returns 
     */
    static emptyNode(node) {
        node.replaceChildren();
        // let firstChild = node.firstChild;
        // while(firstChild) {node.lastChild.remove()}
        return node;
    }

    /**
     * isZero
     * @param value
     * @returns {boolean}
     */
    static isZero(value) {
        let ret = false;
        if (typeof value === 'string' || typeof value === 'number') {
            ret = (parseInt(value) === 0);
        }
        return ret;
    };

    static isFormField(element) {
        switch (element.nodeName.toLowerCase()) {
            case 'input':
            case 'textarea':
            case 'select':
                return true;
                break;
            default:
                return false;
                break;
        }
    }

    static throwError(name, message, code) {
        throw new OverdriveError(name, message, code)
    }
}

// export default;
