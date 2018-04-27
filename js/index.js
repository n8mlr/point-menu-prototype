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
        this.origin = {};
        this.stemLength = 80; // pixel length of connecting stem
    }

    set coordinates(point) {
        this.element.style.transform = `translate(${point.x}px, ${point.y}px)`;
    }

    openAtPoint(pt) {
        this.origin = pt;
        this.calcAvailableQuadrant(pt, 
                                   this.element.getBoundingClientRect(),
                                   this.stemLength);
    }

    /**
     * Determines where the point menu should be rendered given the size of the menu and the origin of click
     */
    calcAvailableQuadrant(ptOrigin, boundingRect, originOffset) {
        // determine the first available quadrant going in order of North, West, East, and South

        // who has the most space?
        // we want the best case of a) preferred quadrant b) no clipping
        let availablePixels = {};

        // will the menu fit in the north quadrant?
        availablePixels.north = ptOrigin.y - boundingRect.height + originOffset;
        availablePixels.west = ptOrigin.x - boundingRect.width + originOffset;
        availablePixels.east = window.innerWidth - ptOrigin.x - boundingRect.width - originOffset;
        availablePixels.south = window.innerHeight - ptOrigin.y - boundingRect.height - originOffset;

        // evaluate possible layouts
        let rectNorth = new Rectangle(ptOrigin.x - (boundingRect.width / 2), 
                                      ptOrigin.y - boundingRect.height - originOffset,
                                      boundingRect.width,
                                      boundingRect.height);

        let rectWest = new Rectangle(ptOrigin.x - boundingRect.width - originOffset,
                                     ptOrigin.y - (boundingRect.height / 2),
                                     boundingRect.width,
                                     boundingRect.height);

        let rectEast = new Rectangle(ptOrigin.x + originOffset,
                                     ptOrigin.y - (boundingRect.height / 2),
                                     boundingRect.width,
                                     boundingRect.height);

        let rectSouth = new Rectangle(ptOrigin.x - (boundingRect.width / 2),
                                      ptOrigin.y + originOffset,
                                      boundingRect.width,
                                      boundingRect.height);


        let renderRect = rectNorth;
        this.coordinates = new Point(renderRect.x, renderRect.y);


        let rectScreen = new Rectangle(0,0,window.innerWidth, window.innerHeight);
        let intersectArea = rectScreen.calcIntersectArea(renderRect);
        console.log("Screen:", rectScreen);
        console.log("PoinMenu", renderRect);
        console.log("Area:", intersectArea);
    }

    /**
     * Returns true when rectangle B fully subsumes rectangle A
     */
    doesRectContainRect(rectA, rectB) {

    }
}


function onMapClick(e) {
    pm.openAtPoint(new Point(e.clientX, e.clientY));
}



// Run
let pm = new PointMenu("pm");
pm.openAtPoint(500,500);

let container = document.getElementById("container");
addEventListener("click", onMapClick);