/*
Copyright (C) 2011-2013 by Gregory Burlet, Alastair Porter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * Creates a cheironomic notation system without lines
 * @class Represents a system container with no lines
 * @extends Toe.Model.System
 * 
 * @param {Array} bb [ulx, uly, lrx, lry] system bounding box, which encompasses a line
 * of music on the page.
 * (.) <ulx,uly>        (.)
 *
 *
 * (.)        <lrx,lry> (.)
 *
 * @param {Object} options [numlines {Number}, interact {Boolean}]
 *
 * The system has a list of elements (neumes) on the system, sorted by horizontal position.
 */
Toe.Model.CheironomicSystem = function(bb, options) {
    // call super constructor
    Toe.Model.System.call(this, bb, options);
};

// inherit prototype from generic system model
Toe.Model.CheironomicSystem.prototype = new Toe.Model.System();
Toe.Model.CheironomicSystem.prototype.constructor = Toe.Model.CheironomicSystem;

/**
 * Mounts a neume on the system
 *
 * @methodOf Toe.Model.CheironomicSystem
 * @param {Toe.Model.Neume} neume The neume to mount
 * @params {Options} options {justPush: just push to the elements array (don't bother with sorted insert.
                              This option is for inserting from MEI, since elements are in order in MEI 
                              document already. Faster load times.)}
 * @return {Number} ind index of element on the system
 */
Toe.Model.CheironomicSystem.prototype.addNeume = function(neume, options) {
    // check argument is a neume
    if (!(neume instanceof Toe.Model.Neume)) {
        throw new Error("Toe.Model.CheironomicSystem: Invalid neume");
    }
    
    var opts = {
        justPush: false
    };

    $.extend(opts, options);

    // insert neume into list of sorted system elements
    var nInd = null;
    if (opts.justPush) {
        this.elements.push(neume);
        nInd = this.elements.length-1;
    }
    else {
        nInd = this.insertElement(neume);
    }

    neume.setSystem(this);

    // update view
    $(neume).trigger("vRenderNeume", [neume]);

    return nInd;
}
