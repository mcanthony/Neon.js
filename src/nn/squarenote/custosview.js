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
 * Creates a new custos view
 *
 * @class View for the custos
 * @param {Toe.View.RenderEngine} renderEngine The rendering engine
 */
Toe.View.CustosView = function(renderEngine) {
    this.rendEng = renderEngine;

    this.drawing = null;
    this.ledgerLines = null;
};

Toe.View.CustosView.prototype = new Toe.View.View();
Toe.View.CustosView.prototype.constructor = Toe.View.CustosView;

Toe.View.CustosView.prototype.drawLedgerLines = function(aSystemPos, centre, width, aSystem) {
    width *= 0.75;

    var cv = this;
    var ledgers = new Array();
    var bottomSystemPos = 2*(1-aSystem.props.numLines);
    if (aSystemPos > 0) {
        for (var i = 0; i <= aSystemPos; i += 2) {
            var line_y = aSystem.zone.uly - (i*aSystem.delta_y/2);
            ledgers.push(cv.rendEng.createLine([centre-width, line_y, centre+width, line_y]));
        }
    }
    else if (aSystemPos < bottomSystemPos) {
        for (var i = bottomSystemPos; i >= aSystemPos; i -= 2) {
            var line_y = aSystem.zone.uly - (i*aSystem.delta_y/2);
            ledgers.push(cv.rendEng.createLine([centre-width, line_y, centre+width, line_y]));
        }
    }

    this.ledgerLines = this.rendEng.draw({fixed: ledgers, modify: []}, {group: true, selectable: false})[0];
}

/**
 * Renders the custos on the systems
 *
 * @methodOf Toe.View.CustosView
 * @param {Toe.Model.Custos} custos Custos to render
 */
Toe.View.CustosView.prototype.renderCustos = function(custos) {
    if (!this.rendEng) {
        throw new Error("Custos: Invalid render context");
    }

    // get the system this custos is mounted on
    var system = custos.system;

    var glyphCustos = this.rendEng.getGlyph("custos");

    // calculate the y position of the custos
    var custos_y = system.zone.uly - custos.rootSystemPos*system.delta_y/2;
    var nc_x = custos.zone.ulx + glyphCustos.centre[0];
    var custosDwg = glyphCustos.clone().set({left: nc_x, top: custos_y - glyphCustos.centre[1]/2});

    this.drawLedgerLines(custos.rootSystemPos, nc_x, 4*glyphCustos.centre[0], system);
	this.drawing = this.rendEng.draw({fixed: [], modify: [custosDwg]}, {selectable: custos.props.interact, group: true, lockMovementX: true, lockMovementY: true, eleRef: custos})[0];
}

/**
 * Renders the bounding box of the custos
 *
 * @methodOf Toe.View.CustosView
 * @param {Toe.Model.Custos} custos Custos to render the bounding box
 */
Toe.View.CustosView.prototype.renderBoundingBox = function(custos) {
    var c_bb = [custos.zone.ulx, custos.zone.uly, custos.zone.lrx, custos.zone.lry];
    this.rendEng.outlineBoundingBox(c_bb, {fill: "purple"});
}

Toe.View.CustosView.prototype.updateSystemPosition = function(custos) {
    if (!this.drawing) {
        throw new Error("Custos: update method called, but there exists no drawing to update.");
    }
    if (this.ledgerLines) {
        this.rendEng.canvas.remove(this.ledgerLines);
        this.ledgerLines = null;
    }

    var system = custos.system;

    var glyphTop = system.zone.uly - custos.rootSystemPos*system.delta_y/2 - this.drawing.currentHeight/4;
    this.drawing.top = glyphTop;

    this.drawLedgerLines(custos.rootSystemPos, this.drawing.left, (3/2)*this.drawing.currentWidth, system);

    this.rendEng.repaint();

    // update model
    $(custos).trigger("mUpdateBoundingBox", this.drawing);
}

Toe.View.CustosView.prototype.eraseDrawing = function() {
    if (this.drawing) {
        this.rendEng.canvas.remove(this.drawing);
    }
    if (this.ledgerLines) {
        this.rendEng.canvas.remove(this.ledgerLines);
        this.ledgerLines = null;
    }

    this.rendEng.repaint();
}

Toe.View.CustosView.prototype.selectDrawing = function() {
    this.rendEng.canvas.setActiveObject(this.drawing);
}
