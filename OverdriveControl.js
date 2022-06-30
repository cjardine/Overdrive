'use strict';

// import Overdrive from "Overdrive";

class OverdriveControl extends HTMLElement {

    /**
     *
     * @param {object} initializationObject
     * @param {object} initializationObject.root
     * @param {string} initializationObject.name
     * @param {string} initializationObject.elementName
     * @param {string} initializationObject.template
     * @param {function} initializationObject.constructorFunction
     * @param {function} [initializationObject.instantiationFunction]
     */
    constructor(initializationObject) {
        super();
        this.overdrive = {
            _bindings: {},
            _data: {},
            scope: {
                $root: initializationObject.root,
                $element: this
            }
        };

        if (Overdrive.isString(initializationObject.template)) {
            this.overdrive.template = initializationObject.template;
        } else {
            Overdrive.throwError('ControlInitializationFailed', 'During initialization of ' + initializationObject.name + '. No \'template\' defined.')
        }


        if (Overdrive.isFunction(initializationObject.constructorFunction)) {
            this.overdrive.constructorFunction = initializationObject.constructorFunction;
            this.overdrive.constructorFunction.bind(this.overdrive.scope)(this.overdrive.scope);
        } else {
            Overdrive.throwError('ControlInitializationFailed', 'During initialization of ' + initializationObject.name + '. No \'constructorFunction\' defined.')
        }


        this.appendTemplate(this.overdrive.template);


        if (Overdrive.isFunction(initializationObject.instantiationFunction)) {
            this.overdrive.instantiationFunction = initializationObject.instantiationFunction;
            setTimeout(this.overdrive.instantiationFunction.bind(this.overdrive.scope)(), 1);
        }
    }

    updateValues(elements, value) {
        if (Array.isArray(elements) && elements.length) {
            elements.forEach((currentElement, ind, array) => {
                if (Overdrive.isFormField(currentElement)) {
                    if (currentElement.value !== value) {
                        currentElement.value = value;
                    }
                } else {
                    if (currentElement.innerHTML !== value) {
                        currentElement.innerHTML = value;
                    }
                }
            });
        }
   }

    appendTemplate(template) {
        let output = document.createRange().createContextualFragment(template);
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        this.handleAllBindings(output);

        this.appendChild(output);

    }

    handleAllBindings(output) {
        this.handleForBind(output);
        this.handleDataBind(output);
        this.handleActionEventFunctionBind(output);
    }

    static isElementAddBindings(element, bindingKey) {
        let ret = false;
        if (!element.hasOwnProperty('__od_bindings')) {
            element.__od_bindings = [];
        }
        if (element.__od_bindings.indexOf(bindingKey) < 0) {
            element.__od_bindings.push(bindingKey);
            ret = true;
        }
        return ret;
    }

    handleForBind(output) {

        let self = this;
        let bindingsElements;
        bindingsElements = output.querySelectorAll('[data-od-for]');
        bindingsElements.forEach((currentElement, ind, array) => {
            let currentBindingName;
            let currentScopeMapping;
            let forMap, forItems, forItem;
            let currentParent = currentElement.parentNode;
            let template = currentElement.outerHTML;
            if (OverdriveControl.isElementAddBindings(currentElement, 'data-od-for')) {
                currentBindingName = currentElement.getAttribute('data-od-for');


                forMap = currentBindingName.split(' in ');
                forItem = forMap[0];
                forItems = forMap[1];
                currentScopeMapping = self.getPath(forItems, self.overdrive.scope);
                currentParent.__od_template = currentElement.outerHTML;

                if (!Overdrive.isArray(currentScopeMapping)) {
                    Overdrive.throwError();
                } else {

                    Overdrive.emptyNode(currentParent);
                    currentScopeMapping.forEach((item, ind, array) => {

                    });
                    if (!self.overdrive._data.hasOwnProperty(currentBindingName)) {
                        Object.defineProperty(self.overdrive.scope, currentBindingName, {
                            get: function () {
                                return self.overdrive._data[currentBindingName];
                            },
                            set: function (new_value) {
                                self.overdrive._data[currentBindingName] = new_value;
                                self.overdrive._data['modified'] = (new Date()).getTime();
                                self.updateValues(self.overdrive._bindings[currentBindingName], new_value);
                            }
                        });
                        self.overdrive.scope[currentBindingName] = currentScopeMapping;
                    }
                }
            }
        });
    }

    handleActionEventFunctionBind(output) {
        let actionEventTypes = ['click',
            'dblclick',
            'mouseenter',
            'mouseover',
            'mousemove',
            'mousedown',
            'mouseup',
            'auxclick',
            'contextmenu',
            'wheel',
            'mouseleave',
            'mouseout',
            'select'];
        let bindingsElements;
        actionEventTypes.forEach((actionEvent, ind, array) => {
            bindingsElements = output.querySelectorAll('[data-od-' + actionEvent + ']');
            bindingsElements.forEach((currentElement, ind, array) => {
                let currentBindingName;
                let currentScopeMapping;
                if (OverdriveControl.isElementAddBindings(currentElement, 'data-od-' + actionEvent)) {
                    currentBindingName = currentElement.getAttribute('data-od-' + actionEvent);
                    currentScopeMapping = this.getPath(currentBindingName, this.overdrive.scope);
                    currentElement.addEventListener(actionEvent, (event) => {
                        currentScopeMapping(event);
                    });

                }
            });
        });
    }

    handleDataBind(output) {
        let bindingsElements;
        bindingsElements = output.querySelectorAll('[data-od-bind]');
        bindingsElements.forEach((currentElement, ind, array) => {

            if (OverdriveControl.isElementAddBindings(currentElement, 'data-od-bind')) {
                let currentBindingName = currentElement.getAttribute('data-od-bind');
                let currentScopeMapping = this.getPath(currentBindingName, this.overdrive.scope);
                if (!this.overdrive._bindings.hasOwnProperty(currentBindingName)) {
                    this.overdrive._bindings[currentBindingName] = []
                }
                this.overdrive._bindings[currentBindingName].push(currentElement);

                if (Overdrive.isFormField(currentElement)) {
                    currentElement.addEventListener('change', (event) => {
                        if (this.overdrive.scope[currentBindingName] !== event.target.value) {
                            this.overdrive.scope[currentBindingName] = event.target.value;
                        }
                    });
                    currentElement.addEventListener('input', (event) => {
                        if (this.overdrive.scope[currentBindingName] !== event.target.value) {
                            this.overdrive.scope[currentBindingName] = event.target.value;
                        }
                    });
                }

                if (!this.overdrive._data.hasOwnProperty(currentBindingName)) {
                    Object.defineProperty(this.overdrive.scope, currentBindingName, {
                        get: () => {
                            return this.overdrive._data[currentBindingName];
                        },
                        set: (new_value) => {
                            this.overdrive._data[currentBindingName] = new_value;
                            this.overdrive._data['modified'] = (new Date()).getTime();
                            this.updateValues(this.overdrive._bindings[currentBindingName], new_value);
                        }
                    });
                    this.overdrive.scope[currentBindingName] = currentScopeMapping;
                }
            }
        });
        for (let key in this.overdrive._bindings) {
            if (this.overdrive._bindings.hasOwnProperty(key)) {
                this.overdrive.scope[key] = this.overdrive.scope[key]
            }
        }

    }


    getPath(path, obj, fb = `$\{${path}}`) {
        return path.split('.').reduce((res, key) => {
            return res[key] || fb;
        }, obj);
    }


    parseTpl(template, map, fallback) {
        return template.replace(/{{.+?}}/g, (match) => {
            const path = match.substr(2, match.length - 4).trim();
            return this.getPath(path, map, fallback);
        });
    }


}

// export default;
