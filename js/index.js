'use strict';

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class PointMenu {
    constructor(elementId) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.origin = {};
        this.stemLength = 40; // pixel length of connecting stem
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
        

        // will the menu fit in the north quadrant?
        availablePixels.north = ptOrigin.y - boundingRect.height + originOffset;
        availablePixels.west = ptOrigin.x - boundingRect.width + originOffset;
        availablePixels.east = window.innerWidth - ptOrigin.x - boundingRect.width - originOffset;
        availablePixels.south = window.innerHeight - ptOrigin.y - boundingRect.height - originOffset;

        // place the menu in the first available quadrant where no clipping shall occur

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