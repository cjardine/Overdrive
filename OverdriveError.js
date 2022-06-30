
'use strict';

// import Overdrive from "Overdrive";
class OverdriveError extends Error {
    /**
     * constructor
     * @param {string} name
     * @param {string} message
     * @param {number} [code]
     */
    constructor(name, message, code) {
        super(message);
        this.name = name;
        this.message = message;

        if (Overdrive.isNumber(code)) {
            this.code = code;
        }
    }


}
// export default;

OverdriveError.prototype.errors = {


};