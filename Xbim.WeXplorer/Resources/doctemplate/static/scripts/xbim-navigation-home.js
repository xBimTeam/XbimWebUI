

/* Copyright (c) 2016, xBIM Team, Northumbria University. All rights reserved.

This javascript library is part of xBIM project. It is provided under the same 
Common Development and Distribution License (CDDL) as the xBIM Toolkit. For 
more information see http://www.openbim.org

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
﻿xHomeTextures = {
    en: "data:image/png;base64,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SsR29L9i99nLfjBJ0+QW4Niu1q8u94GWHaMS8Uz6W/d7LHeMpKn0Bfpb/59fzoMs6wJ2iTgcuBVDJM2zPYBbhx4s2ZJjVCJOAD4JbLucAZJmwrbAJ4cuLMmSYlQi3gZcCKxa6hNLmjmrgAuHPizaoq4ZlYgNgQ8CY/k5A0kz40zg9K7WRxf6BxYcoxKxOf2tvLH9BKakmfJ3wAldrd9ayAcvKEYlYifgSmCsZ1MkzZx/AY7qav3v9X3geq8ZlYj96Q+7GiJJi3Ug/SHb/df3geuMUYl4Pv1h151HNEzS/NmZ/pDtOt/P7EljVCJeR/9Psy1GPEzS/NkCuHLoylo94ZrRcNj194GJvweupLnwHuC3fviQ7eNiVCJWAn8NNPntAJLmxgXAq7taH/q///H9GJWIbYDLgOe02SZpzqwBjutq/ToMMSoRu9Mfdt2r6TRJ8+Yu+kO298S/wmHA5cD2jUdJmk9fAY7ZCHiM6XtDtOcBv916hJTUu4HrW49YpMc26mr9+9YrFqtE7Nh6g5TYnV2tN7QesVgT//XWkrQ2xkhSCsZIUgrGSFIKxkhSCsZIUgrGSFIKxkhSCsZIUgrGSFIKxkhSChu1HpDdhltuCRGtZ0xcffRRHnvggZE/7garVxMbbjjyx02vVh69//7WK1IzRuux1333EStXtp4xcQ/ecQd3Hzj6Xwiz25o1rDrggJE/bnb1oYe4c5W/gHld/GeapBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFDZqPSC7r51xBrFiResZE/fIvfeO5XHvP/98vn3DDWN57Mzqww+3npBe1Fpbb1i0EnEScEHrHVJSJ3e1Xth6xGL5zzRJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKfwvQct8OdSrePoAAAAASUVORK5CYII="
};﻿/**
 * This is constructor of the Home plugin for {@link xViewer xBIM Viewer}. It gets optional Image object as an argument. If no image
 * is specified there is a default one (which is not very prety). 
 * @name xNavigationHome
 * @constructor
 * @classdesc This is a plugin for xViewer which renders interactive home button. It is customizable in terms of alpha 
 * behaviour and its position on the viewer canvas as well as definition of the distance and view direction. Use of plugin:
 *  
 *     var home = new xNavigationHome();
 *     viewer.addPlugin(home);
 * 
 *
 * @param {Image} [image = null] - optional image to be used for a button.
*/
function xNavigationHome(image) {
    //private variables
    this._image = image;

   /**
   * Size of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.2. 
   * @member {Number} xNavigationHome#ratio
   */
    this.ratio = 0.2;

    /**
   * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05. 
   * @member {Number} xNavigationHome#placementX
   */
    this.placementX = 0.05;

    /**
   * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05. 
   * @member {Number} xNavigationHome#placementY
   */
    this.placementY = 0.05;

    /**
   * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
   * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent 
   * when user hovers over. Default value is 1.0. 
   * @member {Number} xNavigationHome#activeAlpha
   */
    this.activeAlpha = 1.0;

    /**
    * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
    * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent 
    * when user is not hovering over. Default value is 0.3. 
    * @member {Number} xNavigationHome#passiveAlpha
    */
    this.passiveAlpha = 0.3;

    /**
    * Distance to be used for a home view. If null, default viewer distance for a full extent mode is used. Default value: null
    * @member {Number} xNavigationHome#distance
    */
    this.distance = null;

    /**
    * View direction to be used for a home view. Default value: [1, 1, -1]
    * @member {Number} xNavigationHome#viewDirection
    */
    this.viewDirection = [1, 1, -1];
}

xNavigationHome.prototype.init = function (xviewer) {
    this._viewer = xviewer;
    var self = this;

    if (typeof (this._image) === "undefined") {
        //add HTML UI to viewer port
        var data = xHomeTextures["en"];

        var image = new Image();
        self._image = image;
        image.addEventListener("load", function () {
            self._adjust();
        });
        image.src = data;
    } else {
        self._adjust();
    }

    //add image to document
    document.documentElement.appendChild(this._image);

    //add click event listener
    image.addEventListener("click", function() {
        var viewer = self._viewer;
        //set target to full extent
        viewer.setCameraTarget();
        var origin = viewer._origin;
        var distance = self.distance != null ? self.distance : viewer._distance;

        var normDirection = vec3.normalize(vec3.create(), self.viewDirection);
        var position = vec3.scale(vec3.create(), normDirection, -1.0 * distance);

        viewer.setCameraPosition(position);
    });

    //set active state styling
    image.addEventListener("mouseover", function () {
        self._image.style.opacity = self.activeAlpha; //For real browsers;
        self._image.style.filter = "alpha(opacity=" + Math.round(self.activeAlpha * 100.0) + ")"; //For IE;
    });

    //set passive state styling
    image.addEventListener("mouseleave", function () {
        self._image.style.opacity = self.passiveAlpha; //For real browsers;
        self._image.style.filter = "alpha(opacity=" + Math.round(self.passiveAlpha * 100.0) + ")"; //For IE;
    });

    //set initial styling
    image.style.opacity = this.passiveAlpha; //For real browsers;
    image.style.filter = "alpha(opacity=" + Math.round(this.passiveAlpha * 100.0) + ")"; //For IE;
}

xNavigationHome.prototype._adjust = function() {
    var canvas = this._viewer._canvas;
    function getOffsetRect(elem) {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;


        var top = Math.round(box.top + scrollTop - clientTop);
        var left = Math.round(box.left + scrollLeft - clientLeft);
        var width = Math.round(box.width);
        var height = Math.round(box.height);

        return { top: top, left: left, width: width, height: height };
    }

    //get position, width and height
    var rect = getOffsetRect(canvas);

    //set image size to what it should be (both relative to height so it is not destorted)
    this._image.style.width = Math.round(rect.height * this.ratio) + "px";
    this._image.style.height = Math.round(rect.height * this.ratio) + "px";

    //place image to the desired position
    this._image.style.position = "absolute";
    this._image.style.left = Math.round(rect.left + rect.width * this.placementX) + "px";
    this._image.style.top = Math.round(rect.top + rect.height * this.placementY) + "px";

};

xNavigationHome.prototype.onBeforeDraw = function () { };

xNavigationHome.prototype.onBeforePick = function(id) { }

xNavigationHome.prototype.onAfterDraw = function() { this._adjust(); }

xNavigationHome.prototype.onBeforeDrawId = function () { };

xNavigationHome.prototype.onAfterDrawId = function () { };

xNavigationHome.prototype.onBeforeGetId = function (id) { }

xNavigationHome.prototype.draw = function() { }
