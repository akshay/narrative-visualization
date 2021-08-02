'use strict';

const FIRST_HEADERS = [
    'Crypto is handling more money than ever before',
    'Crypto is using more energy than ever before',
    'Electronic waste: a dismal future'
];
const FIRST_PARAGRAPHS = [
    'Since Bitcoin, there are over 3,000 cryptocurrencies active today. There are solutions to address many complex financial needs today, such as privacy, security, proof of ownership, digital assets and decentralized utilities. Despite the large number of cryptocurrencies today, it still remains true that Bitcoin and Ethereum handle the majority of the market capitalization today.',
    'For the future of our environment, we must understand that Bitcoin, while being the largest crypto by market capitalization, has a large environmental footprint. Compared to other financial systems like VISA, Bitcoin has an unacceptably high energy usage.',
    'Bitcoin also creates more e-waste than any other cryptocurrency, and we must take actions to stop its adoption.'
];
const CAPTIONS = [
    'Source: CoinMarketCap.com',
    'Source: BitcoinEnergyConsumption.com',
    'Source: BitcoinEnergyConsumption.com'
];
const AXIS_LABELS = [
    'Market Capitalization (USD)',
    'Electricity Consumption (TWh)',
    'Electronic Waste (kt)'
];
const CSV = [
    '',
    'btc-energy',
    'btc-waste'
];
const CRYPTOS = {
    'btc': 'Bitcoin',
    'eth': 'Ethereum',
    'usdt': 'Tether',
    'bnb': 'Binance Coin',
    'ada': 'Cardano',
    'xrp': 'Ripple',
    'usdc': 'USD Coin',
    'doge': 'Dogecoin',
    'dot': 'Polkadot',
    'uni': 'Uniswap'
};

const MAX_STATE = FIRST_HEADERS.length;
const MIN_STATE = 1;
const PARAGRAPH_ID = 'paragraph';
const VISUAL_ID = 'visual';
const BUTTON_ID = 'button';
const TEMPLATE_ID = 'template';
const height = 500;
const margin = 100;
let state = MIN_STATE;
let crypto = 'btc';

function navigateToState(newState) {
    if (newState > MAX_STATE) {
        newState = MAX_STATE;
    } else if (newState < MIN_STATE) {
        newState = MIN_STATE;
    }
    state = newState;
    window.location.hash = '#' + newState;
    renderContent();
    return false;
}

function changeCrypto(c) {
    crypto = c;
    document.getElementById(BUTTON_ID).innerText = CRYPTOS[c];
    drawVisualizations();
}

function renderContent() {
    let index = state - 1;

    const contentNode = document.getElementById('content');
    contentNode.innerHTML = '';

    const headerNode = document.createElement('h2');
    headerNode.classList.add('section-heading');
    headerNode.appendChild(document.createTextNode(FIRST_HEADERS[index]));
    contentNode.appendChild(headerNode);

    const paragraphNode = document.createElement('p');
    paragraphNode.appendChild(document.createTextNode(FIRST_PARAGRAPHS[index]));
    paragraphNode.setAttribute('id', PARAGRAPH_ID);
    contentNode.appendChild(paragraphNode);

    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgNode.setAttribute('id', VISUAL_ID);
    svgNode.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgNode.setAttribute('width', '100%');
    svgNode.setAttribute('height', '100%');
    contentNode.appendChild(svgNode);

    if (state === 1) {
        const dropdownNode = document.createElement('div');
        dropdownNode.classList.add('dropdown');
        dropdownNode.classList.add('text-center');
        const buttonNode = document.createElement('button');
        buttonNode.setAttribute('data-bs-toggle', 'dropdown');
        buttonNode.setAttribute('type', 'button');
        buttonNode.setAttribute('id', BUTTON_ID);
        buttonNode.classList.add('btn');
        buttonNode.classList.add('btn-secondary');
        buttonNode.classList.add('dropdown-toggle');
        buttonNode.appendChild(document.createTextNode(CRYPTOS[crypto]));
        dropdownNode.appendChild(buttonNode);

        const menuNode = document.createElement('div');
        menuNode.classList.add('dropdown-menu');

        for (let c of Object.keys(CRYPTOS)) {
            const aNode = document.createElement('a');
            aNode.classList.add('dropdown-item');
            aNode.appendChild(document.createTextNode(CRYPTOS[c]));
            aNode.setAttribute('href', '#' + state);
            aNode.setAttribute('onclick', 'changeCrypto("' + c + '")');
            menuNode.appendChild(aNode);
            aNode.addEventListener('onclick', (event) => {
                event.preventDefault();
                event.stopPropagation();
                return changeCrypto(c);
            });
        }

        dropdownNode.appendChild(menuNode);
        contentNode.appendChild(dropdownNode);
    }

    const captionNode = document.createElement('span');
    captionNode.classList.add('caption');
    captionNode.classList.add('text-muted');
    captionNode.appendChild(document.createTextNode(CAPTIONS[index]));
    contentNode.appendChild(captionNode);

    const listNode = document.createElement('ul');
    listNode.classList.add('list-inline');
    listNode.classList.add('text-center');
    contentNode.appendChild(listNode);

    if (state > MIN_STATE) {
        const itemNode = document.createElement('li');
        itemNode.classList.add('list-inline-item');
        const buttonNode = document.createElement('a');
        buttonNode.appendChild(document.createTextNode('<< Prev'));
        buttonNode.setAttribute('href', '#' + (state - 1));
        buttonNode.setAttribute('onclick', 'navigateToState(' + (state - 1) + ')');
        itemNode.appendChild(buttonNode);
        listNode.appendChild(itemNode);
        buttonNode.addEventListener('onclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            return navigateToState(state - 1);
        });
    }

    if (state < MAX_STATE) {
        const itemNode = document.createElement('li');
        itemNode.classList.add('list-inline-item');
        const buttonNode = document.createElement('a');
        buttonNode.appendChild(document.createTextNode('Next >>'));
        buttonNode.setAttribute('href', '#' + (state + 1));
        buttonNode.setAttribute('onclick', 'navigateToState(' + (state + 1) + ')');
        itemNode.appendChild(buttonNode);
        listNode.appendChild(itemNode);
        buttonNode.addEventListener('onclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            return navigateToState(state + 1);
        });
    }
    const templateNode = document.createElement('div');
    templateNode.setAttribute('id', TEMPLATE_ID);
    contentNode.appendChild(templateNode);

    drawVisualizations();
}

const chartWidth = () => document.getElementById(PARAGRAPH_ID).clientWidth;

async function drawVisualizations() {
    let annotations = [];
    const index = state - 1;

    const contentNode = document.getElementById(VISUAL_ID);
    contentNode.innerHTML = '';

    let chart = d3.select('#' + VISUAL_ID);
    chart.attr('width', chartWidth());
    chart.attr('height', height + margin);

    let timeFormatStr;
    let key;

    switch (state) {
        case 1:
            key = 'CapRealUSD';
            timeFormatStr = "%Y-%m-%d";
            if (crypto === 'btc') {
                annotations.push({
                    note: {
                        label: "BTC reaches $64,805",
                        title: "All time high"
                    },
                    data: {
                        date: '2021-04-14',
                        [key]: 347894106272.837
                    },
                    dy: 70,
                    dx: -70
                });
                annotations.push({
                    note: {
                        label: "BTC hits a slump",
                        title: "Price moves sideways"
                    },
                    data: {
                        date: '2018-01-27',
                        [key]: 90350534668.5002
                    },
                    dy: -70,
                    dx: -70
                });
            }
            break;
        case 2:
            timeFormatStr = "%Y/%m/%d";
            key = 'Estimated TWh per Year';
            annotations.push({
                note: {
                    label: "BTC uses more electricity than 150 countries",
                    title: "BTC electricity passes Ukraine's",
                    wrap: 200
                },
                data: {
                    date: '2021/07/26',
                    [key]: 139.06442
                },
                dy: 70,
                dx: -140
            });
            break;
        case 3:
            timeFormatStr = "%Y/%m/%d";
            key = 'E-waste (kt) per Year';
            annotations.push({
                note: {
                    title: "BTC e-waste peaks",
                    label: "1 Transaction = 82 grams, or around 18000 VISA transactions"
                },
                data: {
                    date: '2018/10/10',
                    [key]: 10.74260269
                },
                dy: 130,
                dx: -10
            });
            break;
    }
    annotations.forEach(a => {
        a.color = ["grey"];
        a.subject = {
            radius: 20, // circle radius
            radiusPadding: 20 // white space around circle befor connector
        };
        a.type = d3.annotationCalloutCircle;
    });
    const parseTime = d3.timeParse(timeFormatStr);
    const timeFormat = d3.timeFormat(timeFormatStr);
    const valueFn = d => +d[key];
    const data = await d3.csv('narrative-visualization/' + (index === 0 ? crypto : CSV[index]) + '.csv', {
            mode: 'no-cors'
        },
        d => {
            return {
                date: parseTime(d.date || d.Date),
                [key]: valueFn(d)
            };
        });
    const indexed = {};
    data.forEach(d => indexed[d.date] = valueFn(d));

    const x = d3.scaleTime().range([0, chartWidth() - margin]).domain(d3.extent(data, d => d.date));
    const y = d3.scaleLinear().range([height, 0]).domain(d3.extent(data, d => valueFn(d)));

    const tooltip = d3.select("#" + TEMPLATE_ID)
        .append("div")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");
    chart.append('g').attr('transform', 'translate(' + margin + ',0)').append("path")
        .data([data])
        .attr("class", "line")
        .style("opacity", 0.8)
        .attr("d", d3.line().x(d => x(d.date)).y(d => y(valueFn(d))))
        .on("mouseover", function (d) {
            tooltip.style("opacity", 1);
        })
        .on("mousemove", function (d, i) { 
            let time = timeFormat(x.invert(d3.mouse(this)[0]));
            tooltip.html(AXIS_LABELS[index] + ': ' + (indexed[time] || valueFn(d[i]))).style("left", (d3.mouse(this)[0]+70) + "px").style("top", (d3.mouse(this)[1]) + "px"); 
        })
        .on("mouseleave", function (d) {
            tooltip.style("opacity", 0);
        });

    chart.append('g').style('fill', 'grey').attr("transform", "translate(" + margin + "," + height + ")").call(d3.axisBottom(x));
    let left = d3.axisLeft(y);
    if (index === 0) {
        left = left.tickFormat((d, i) => '$' + (i * 50) + 'B');
    }
    chart.append('g').style('fill', 'grey').attr("transform", "translate(" + margin + ",0)").call(left);
    chart
        .append('g')
        .attr('transform', 'translate(' + (margin / 2) + ', ' + (height / 2) + ')')
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text(AXIS_LABELS[index]);
    chart.append('g').attr('transform', 'translate(' + margin + ',0)').call(
        d3.annotation()
        .annotations(annotations)
        .accessors({
            x: d => x(parseTime(d.date)),
            y: d => y(valueFn(d))
        })
        .accessorsInverse({
            date: d => timeFormat(x.invert(d.x)),
            [key]: d => y.invert(d.y)
        }));

}

function registerHeaderScrollHandler() {
    let scrollPos = 0;
    const mainNav = document.getElementById('mainNav');
    const headerHeight = mainNav.clientHeight;
    window.addEventListener('scroll', function () {
        const currentTop = document.body.getBoundingClientRect().top * -1;
        if (currentTop < scrollPos) {
            // Scrolling Up
            if (currentTop > 0 && mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-visible');
            } else {
                mainNav.classList.remove('is-visible', 'is-fixed');
            }
        } else {
            // Scrolling Down
            mainNav.classList.remove(['is-visible']);
            if (currentTop > headerHeight && !mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-fixed');
            }
        }
        scrollPos = currentTop;
    });
}

window.addEventListener('DOMContentLoaded', () => {
    registerHeaderScrollHandler();
    try {
        navigateToState(window.location.hash ? parseInt(window.location.hash.substring(1)) : MIN_STATE);
    } catch (e) {
        navigateToState(MIN_STATE);
    }
});
