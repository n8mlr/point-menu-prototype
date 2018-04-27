'use strict';

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
        this.dot = document.querySelector("#originPoint");
        this.stemLength = 80; // pixel length of connecting stem
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
        let ptMenuLocation = this.getBestLayout(pt, rectMenu, this.stemLength);
        PointMenu.translate(this.element, ptMenuLocation);

        // Move the stem origin to the location
        let ptDot = PointMenu.globalToLocal(pt, ptMenuLocation);
        PointMenu.translate(this.dot, ptDot);

        console.log("ptDot", ptDot);


        var ptTerminal = new Point();
        ptTerminal.x = (ptDot.x < 0) ? ptMenuLocation.x - this.stemLength : ptDot.x - this.stemLength;
        ptTerminal.y = (ptDot.y < 0) ? ptMenuLocation.y : ptDot.y;

        // if north or south orientation, x is equal to half the width of the

        console.log("ptTerminal", PointMenu.globalToLocal(ptTerminal, ptDot));

        // Draw the stem connecting the user's tap location to the menu
    }

    static translate(element, point) {
        element.style.transform = `translate(${point.x}px, ${point.y}px)`;
    }

    /**
     * Transforms a screen coordinate to a local coordinate
     */
    static globalToLocal(ptGlobal, ptLocal) {
        let dx = ptGlobal.x - ptLocal.x;
        let dy = ptGlobal.y - ptLocal.y;
        return new Point(dx, dy);
    }

    /**
     * Determines where the point menu should be rendered by optimizing for visible are of the rectangular shape
     * 
     * @param {Point} ptOrigin - the screen coordinates where the user tapped or clicked
     * @param {Rectangle} boundingRect - the rectangular shape to be rendered
     * @param {int} originOffset - the amount of padding to add between the menu and the interaction point
     * @return {Point}
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
            boundingRect.height));

        // East
        rectLayouts.push(new Rectangle(ptOrigin.x + originOffset,
            ptOrigin.y - (boundingRect.height / 2),
            boundingRect.width,
            boundingRect.height));

        // West
        rectLayouts.push(new Rectangle(ptOrigin.x - boundingRect.width - originOffset,
            ptOrigin.y - (boundingRect.height / 2),
            boundingRect.width,
            boundingRect.height));

        // North
        rectLayouts.push(new Rectangle(ptOrigin.x - (boundingRect.width / 2),
            ptOrigin.y - boundingRect.height - originOffset,
            boundingRect.width,
            boundingRect.height));

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

        return new Point(rectLargestArea[0].x, rectLargestArea[0].y);
    }
}


function onMapClick(e) {
    pm.openAtPoint(new Point(e.clientX, e.clientY));
}



// Run
let pm = new PointMenu("pm");


let container = document.getElementById("container");
addEventListener("click", onMapClick);