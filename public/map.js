class DateClass {
    year = 2023;
    month = 12;

    constructor(value) {
        if (Array.isArray(value)) {
            this.month = parseInt(value[0]);
            this.year = parseInt(value[1]);
        } else if (!isNaN(value)) {
            value = parseInt(value);
            this.month = value % 12 + 1;
            this.year = 1946 + Math.floor(value / 12);
        }
    }

    into(other1, other2) {
        if (other1.year < this.year && this.year < other2.year) {
            return true;
        } else if (other1.year === this.year || this.year === other2.year) {
            if (other1.year === this.year && other1.month > this.month) {
                return false;
            }
    
            if (this.year === other2.year && this.month > other2.month) {
                return false;
            }

            return true;
        } else {
            return false;
        }
    }
}

class MapElement {
    element;
    id = '';
    tag = '';
    title = '';
    description = '';
    type='';

    constructor(element) {
        this.element = element;
        this.id = $(element).attr('data-id');
        this.title = $(element).attr('data-title');
        this.tag = element.tagName;

        this.description = $(element).attr('data-description');
        if (this.description === null) {
            this.description = "Void";
        }

        $(this.element).attr('style', '');
    }

    hide() {
        $(this.element).attr('style', 'display: none;');
    }

    show() {
        $(this.element).attr('style', 'display: visibility;');
    }

    click() {
        // No operations
    }

    toSVG() {
        $(this.element).attr("transform", 'scale(1.561)');
        this.element.classList.add(this.type);
        return this.element;
    }

}

class CountryElement extends MapElement {
    constructor(element) {
        super(element);
        this.type = "other-countries";
    }
}

class RussiaElement extends MapElement {
    constructor(element) {
        super(element);
        this.type = "russia";
    }
}

class CityElement extends MapElement {
    constructor(element) {
        super(element);
        this.type = "city";
    }
}

class RailwayElement extends MapElement {
    constructor(element) {
        super(element);
        this.type = "railway";
    }

    click() {
        const popupBg = document.querySelector('.info_bg');
        const popup = document.querySelector('.info');

        popup.querySelector('.info_title').innerText = this.title;
        popup.querySelector('.info_description').innerHTML = this.description;
        popupBg.classList.add('active');
    }
}

class MapClass {
    elements = {};
    container = null;
    date = null;

    constructor(settings) {
        this.settings = settings;
        this.container = $(settings.container);
        this.date = new DateClass(settings.date);

        this.loadImage();
        const promise = this.loadSVG();

        const tooltip = document.querySelector('.tooltip');

        promise.then(() => {
            // console.log(this.elements);
        });     
        
        $(".map-svg-elements")
        .on("mousemove", "*", e => {
            const element = this.generateMapElement(e.target);
            tooltip.innerText = element.title;
            tooltip.style.display = 'block';
            tooltip.style.top = (e.clientY + 15) + 'px';
            tooltip.style.left = (e.clientX + 15) + 'px';
        })
        .on("mouseleave", "*", e => {
            tooltip.style.display = 'none';
        })
        .on("click", "*", e => {
            const target = e.currentTarget;
            const targetElement = this.generateMapElement(target);
            targetElement.click();
            console.log(targetElement);
        });
        
        document.addEventListener("click", (e) => {
            const popupBg = document.querySelector('.info_bg');

            if (e.target === popupBg) {
                popupBg.classList.remove('active');
            }
        });
        
    }

    async loadSVG() {
        return new Promise(resolve => {
            $.ajax({
                url: this.settings.svg,
                success: (response) => {
                    const svg = $(response);
                    
                    $('[data-id]', svg).each((i, element) => {
                        this.registerElement(element);
                    });

                    this.uploadSVG();
    
                    resolve(svg);
                }
            });
        });
    }

    uploadSVG() {
        for (let key in this.elements) {
            const element = this.elements[key];
            const fields = key.split('_');
            
            const datePrev = new DateClass([fields[1], fields[2]]);
            const datePost = new DateClass([fields[3], fields[4]]);
            
            if (this.date.into(datePrev, datePost)) {
                element.show();
            } else {
                element.hide();
            }
        }
    }

    generateMapElement(element) {
        const tag = $(element).attr('data-id');

        let mapElement = null;

        if (tag.startsWith("russia")) {
            mapElement = new RussiaElement(element);
        } 
        else if (tag.startsWith("country")) {
            mapElement = new CountryElement(element);
        } 
        else if (tag.startsWith("city")) {
            mapElement = new CityElement(element);
        } 
        else if (tag.startsWith("railway")) {
            mapElement = new RailwayElement(element);
        }

        return mapElement;
    }

    registerElement(element) {
        const mapElement = this.generateMapElement(element);
        this.elements[mapElement.id] = mapElement;
        $('.map-svg-elements', this.container).append(mapElement.toSVG());
    }

    loadImage() {
        const img = new Image();
        img.src = this.settings.map;
        img.onload = () => {
            $('.svg-full-size', this.container)
                .attr('xlink:href', img.src)
                .attr('width', img.width)
                .attr('height', img.height);

            $('.map-svg', this.container)
                .attr('viewBox', `0  0 ${img.width} ${img.height}`);
        };
    }

    setDate(date) {
        this.date = date;
        this.uploadSVG();
    }
    
}

async function Init(settings) {
    console.log("Page is working.");
    window.Map = new MapClass(settings);
}


function rangeSlider(value) {
    date = new DateClass(value);
    if (date.month === window.Map.date.month && 
        date.year === window.Map.date.year) {
        return;
    }

    months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
    document.getElementById("rangeValue").innerHTML = months[date.month - 1] + " " + (date.year) + " года";

    window.Map.setDate(date);
}

window.Map = null;
