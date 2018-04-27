'use strict';

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Rectangle {
    constructor(x, y, width, height, label) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
    }

    /**
     * Returns the area of intersection with another rectangle
     */
    calcIntersectArea(rect) {
        // Take the difference in x and y vector lengths
        let dx = Math.min(this.x + this.width, rect.x + rect.width) - Math.max(this.x, rect.x);
        let dy = Math.min(this.y + this.height, rect.y + rect.height) - Math.max(this.y, rect.y);

        // Intersection exists if the difference is greater than zero
        return Math.max(0, dx) * Math.max(0, dy);
    }
}


class PointMenu {
    constructor(elementId) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.menu = document.querySelector("#pmMenu");
        this.dot = document.querySelector("#originPoint");
        this.stem = document.querySelector("#stem");

        // pixel length of connecting stem
        this.stemLength = 80;

        // the distance the menu will travel when animating in
        this.driftLength = 128;

        this.hide();
    }

    set coordinates(point) {
        this.element.style.transform = `translate(${point.x}px, ${point.y}px)`;
    }

    hide() {
        this.element.style.display = "none";
    }

    show() {
        this.element.style.display = "block";
    }

    /**
     * Opens the menu at a given coordinate
     * @param {Point} pt
     */
    openAtPoint(pt) {
        this.show();

        let rectMenu = this.element.getBoundingClientRect();
        let layout = this.getBestLayout(pt, rectMenu, this.stemLength);

        // Move the menu to the most visible location
        let ptMenuLocation = layout[0];
        let strStemDirection = layout[1];
        PointMenu.translate(this.element, ptMenuLocation);

        // Move the dot to the location user tapped
        let ptDot = PointMenu.globalToLocal(pt, ptMenuLocation);
        PointMenu.translate(this.dot, ptDot);

        // Orient the stem according to layout
        this.orientStem(ptDot, rectMenu, strStemDirection);

        // Animate the intro
        this.animateIn(strStemDirection);
    }

    /**
     * Moves the stem to the correct location. This method is brittle and hacky due to my use of CSS
     * tranforms. A better method might use matrix transforms or drawing the line via a canvas
     */
    orientStem(ptOrigin, rectMenu, direction) {
        let x, y;

        if (direction === "N" || direction === "S") {
            // x is offset by half the width of the menu
            x = rectMenu.width / 2 - this.stemLength / 2 - 1;
            y = (ptOrigin.y < 0) ? ptOrigin.y + this.stemLength / 2 : rectMenu.height + this.stemLength / 2;

            this.stem.style.transform = `translate(${x}px,${y}px) rotate(90deg)`;
        } else {
            // y is offset by half the height of the menu
            x = (ptOrigin.x < 0) ? ptOrigin.x : rectMenu.width;
            PointMenu.translate(this.stem, new Point(x, rectMenu.height / 2 - 1));
        }
    }

    static translate(element, point) {
        element.style.transform = `translate(${point.x}px, ${point.y}px)`;
    }

    static rotate(element, degrees) {
        element.style.transform = `rotate(${degrees}deg)`;
    }

    /**
     * Transforms a screen coordinate to a local coordinate
     */
    static globalToLocal(ptGlobal, ptLocal) {
        let dx = ptGlobal.x - ptLocal.x;
        let dy = ptGlobal.y - ptLocal.y;
        return new Point(dx, dy);
    }

    animateIn(direction) {

        /*
        -----------------------
        Animate the menu shape
        -----------------------
         */

        let pMenu = {
            aOpacity: 0,
            zOpacity: 1,
            aScale: 0.4,
            zScale: 1,
            aX: 0,
            zX: 0,
            aY: 0,
            zY: 0
        }

        if (direction === "E" || direction === "W") {
            pMenu.aX = (direction === "E") ? -this.driftLength : this.driftLength;
        } else {
            pMenu.aY = (direction === "N") ? this.driftLength : -this.driftLength;
        }

        TweenMax.fromTo(this.menu,
            0.4, { y: pMenu.aY, x: pMenu.aX, scale: pMenu.aScale }, { y: pMenu.zY, x: pMenu.zX, scale: pMenu.zScale, ease: Power4.easeOut });


        /*
        --------------------------------------
        Animate the dot where the user tapped
        --------------------------------------
         */

        // get the current transform applied to the dot, otherwise tweenmax will ovewrite X and Y values
        let match = RegExp(/(-?\d+)px,\s?(-?\d+)px/, 'g').exec(this.dot.style.transform);
        let ptDot = new Point(match[1], match[2]);

        TweenMax.fromTo(this.dot,
            0.25, { x: ptDot.x, y: ptDot.y, scale: 0, opacity: 1 }, { x: ptDot.x, y: ptDot.y, scale: 8, opacity: 0.5 });
        TweenMax.to(this.dot,
            0.25, { scale: 1, opacity: 1, delay: 0.25 });

        /*
        --------------------------------------
        Animate the stem
        --------------------------------------
         */

        TweenMax.fromTo(this.stem, 0.2, { opacity: 0 }, { opacity: 1 });
    }

    /**
     * Determines where the point menu should be rendered by optimizing for visible are of the rectangular shape
     * 
     * @param {Point} ptOrigin - the screen coordinates where the user tapped or clicked
     * @param {Rectangle} boundingRect - the rectangular shape to be rendered
     * @param {int} originOffset - the amount of padding to add between the menu and the interaction point
     * @return [{point}, {string}] - an array containing the coordinate and cardinal direction of menu
     */
    getBestLayout(ptOrigin, boundingRect, originOffset) {
        let rectLayouts = [];

        // Calculate four possible regions for placement. The preferred order for usability on touchscreen
        // devices is north, west, east, and south. Because the algorithm below will optimize for the last
        // item added to rectLayouts[], the order of insertion into the array is important.

        // South
        rectLayouts.push(new Rectangle(ptOrigin.x - (boundingRect.width / 2),
            ptOrigin.y + originOffset,
            boundingRect.width,
            boundingRect.height,
            "S"));

        // East
        rectLayouts.push(new Rectangle(ptOrigin.x + originOffset,
            ptOrigin.y - (boundingRect.height / 2),
            boundingRect.width,
            boundingRect.height,
            "E"));

        // West
        rectLayouts.push(new Rectangle(ptOrigin.x - boundingRect.width - originOffset,
            ptOrigin.y - (boundingRect.height / 2),
            boundingRect.width,
            boundingRect.height,
            "W"));

        // North
        rectLayouts.push(new Rectangle(ptOrigin.x - (boundingRect.width / 2),
            ptOrigin.y - boundingRect.height - originOffset,
            boundingRect.width,
            boundingRect.height,
            "N"));

        // Find the rectangle whose area of intersection with the screen is largest
        let rectScreen = new Rectangle(0, 0, window.innerWidth, window.innerHeight);
        let rectLargestArea = [null, 0];

        for (var i = rectLayouts.length - 1; i >= 0; i--) {
            let area = rectScreen.calcIntersectArea(rectLayouts[i]);
            if (area > rectLargestArea[1]) {
                rectLargestArea[0] = rectLayouts[i];
                rectLargestArea[1] = area;
            }
        }

        return [new Point(rectLargestArea[0].x, rectLargestArea[0].y), rectLargestArea[0].label];
    }
}


function onMapClick(e) {
    pm.openAtPoint(new Point(e.clientX, e.clientY));
}



// Run
let pm = new PointMenu("pm");


let container = document.getElementById("container");
addEventListener("click", onMapClick);