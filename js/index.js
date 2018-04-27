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
        this.dot = document.querySelector("#originPoint");
        this.stem = document.querySelector("#stem");
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
        let layout = this.getBestLayout(pt, rectMenu, this.stemLength);

        let ptMenuLocation = layout[0];
        let stemDirection = layout[1];
        PointMenu.translate(this.element, ptMenuLocation);

        // Move the stem origin to the location tapped
        let ptDot = PointMenu.globalToLocal(pt, ptMenuLocation);
        PointMenu.translate(this.dot, ptDot);




        // This code sucks...what we really need is matrix operations

        // if north or south orientation, rotate the stem by 90 deg
        if (stemDirection === "N" || stemDirection === "S") {
            // x is offset by negative half width
            let x = rectMenu.width / 2 - this.stemLength / 2 - 1;
            let y = (ptDot.y < 0) ? ptDot.y + this.stemLength/2 : rectMenu.height + this.stemLength / 2;

            this.stem.style.transform = `translate(${x}px,${y}px) rotate(90deg)`;
        } else {
            let x = (ptDot.x < 0) ? ptDot.x : rectMenu.width;
            PointMenu.translate(this.stem, new Point(x, rectMenu.height / 2 - 1));
        }


        //console.log("ptTerminal", PointMenu.globalToLocal(ptTerminal, ptDot));

        // Draw the stem connecting the user's tap location to the menu
    }

    orientStem(ptOrigin, rectMenu, direction) {
        
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