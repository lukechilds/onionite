/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */

// Run callback when DOM is ready
function domReady(cb) {
    // Run now if DOM has already loaded as we're loading async
    if (['interactive', 'complete'].includes(document.readyState)) {
        cb();

    // Otherwise wait for DOM
    } else {
        document.addEventListener('DOMContentLoaded', cb);
    }
}
const find = document.querySelector.bind(document);

// Favourite nodes
const favouriteNodes = {

    // Key used in localStorage
    storageKey: 'heartedNodes',

    // Url to heart SVG
    heartPath: '/assets/heart.svg',

    // Class added to heart SVG element when active
    activeClass: 'hearted',

    // Gets current node title
    getCurrentNodeTitle() {
        return find('h2.node-title .name').textContent;
    },

    // Gets hearted nodes
    getHeartedNodes() {
        return JSON.parse(localStorage.getItem(favouriteNodes.storageKey)) || {};
    },

    // Saves hearted nodes
    saveHeartedNodes(heartedNodes) {
        return localStorage.setItem(favouriteNodes.storageKey, JSON.stringify(heartedNodes));
    },

    // Checks if node is hearted
    isHearted(node) {
        return typeof favouriteNodes.getHeartedNodes()[node.fingerprint] !== 'undefined';
    },

    // Heart node
    heart(node) {
        const heartedNodes = favouriteNodes.getHeartedNodes();
        heartedNodes[node.fingerprint] = node;
        favouriteNodes.saveHeartedNodes(heartedNodes);
        favouriteNodes.updateHeartedNodesList();
        return heartedNodes;
    },

    // Unheart node
    unHeart(node) {
        const heartedNodes = favouriteNodes.getHeartedNodes();
        delete heartedNodes[node.fingerprint];
        favouriteNodes.saveHeartedNodes(heartedNodes);
        favouriteNodes.updateHeartedNodesList();
        return heartedNodes;
    },

    // Get list of hearted nodes
    updateHeartedNodesList() {
        const menu = find('.menu');
        if (!menu) {
            return false;
        }

        menu.innerHTML = '';
        const heartedNodes = favouriteNodes.getHeartedNodes();
        const nodeHashes = Object.keys(heartedNodes);
        if (nodeHashes.length > 0) {
            let ul = element('ul');
            nodeHashes.forEach(node3 => {
                let li = element('li');
                let button = element('button');
                button.classList.add('fakelink');
                button.id = node3;
                button.innerHTML = heartedNodes[node3].nickname;
                li.appendChild(button);
                ul.appendChild(li);
                button.onclick = function() {
                    try {
                        fetch('https://onionite-test.vercel.app/api/node/' + node3)
                        .then(response => response.json())
                        .then(data => {
                            data.node.bandwidth = data.bandwidth;
                            showNode(data.node, 1);
                        });
                    } catch {
                        showNode(heartedNodes[node3], 1);
                    }
                };
            });
            menu.appendChild(ul);
        } else {
            menu.innerHTML += '<div class="empty">Click the heart next to a node\'s title on it\'s own page to save it here for easy access :)</div>';
        }

        return menu.innerHTML;
    },

    // Load SVG, run callback when loaded
    loadSVG(cb) {
        // Get heart SVG
        const xhr = new XMLHttpRequest();
        xhr.open('GET', favouriteNodes.heartPath);
        xhr.addEventListener('load', () => {
            cb(xhr.responseText);
        });
        xhr.send();
    },

    // Initiate node favouriting
    init(node2) {
        const nodeTemporary = node2;
        if (nodeTemporary) {
            // Start loading heart SVG before DOM
            favouriteNodes.loadSVG(svg => {
                // Create heart SVG elem
                const div = element('div');
                div.innerHTML = svg;
                const heartElement = div.firstChild;

                // Show heart as active if we've already hearted this node
                if (favouriteNodes.isHearted(node)) {
                    heartElement.classList.add(favouriteNodes.activeClass);
                }

                // Add click handler
                heartElement.addEventListener('click', () => {
                    // Heart/unheart node
                    const node = node2;
                    if (favouriteNodes.isHearted(node)) {
                        heartElement.classList.remove(favouriteNodes.activeClass);
                        favouriteNodes.unHeart(node);
                    } else {
                        heartElement.classList.add(favouriteNodes.activeClass);
                        favouriteNodes.heart(node);
                    }
                });

                // Then inject into DOM when it's ready
                domReady(() => {
                    // Heart
                    const titleElement = find('h2.node-title');
                    if (titleElement) {
                        titleElement.insertBefore(heartElement, titleElement.firstChild);
                    }
                });
            });

            // If current node is hearted
            const node = node2;
            if (favouriteNodes.isHearted(node)) {
                // Heart it again so we get the new name if it's updated
                favouriteNodes.heart(node);
            }
        }
    },
    createMenu() {
        favouriteNodes.loadSVG(svg => {
            domReady(() => {
                const headerHeight = find('.title').offsetHeight;
                const headerBoxShadow = 3;

                // Menu button
                const menuButton = element('div');
                menuButton.classList.add('menu-button');
                menuButton.style.height = headerHeight + 'px';
                menuButton.innerHTML = svg;
                menuButton.addEventListener('click', () => {
                    favouriteNodes.updateHeartedNodesList();
                    find('.menu').classList.toggle('active');
                });
                find('header .wrapper').append(menuButton);

                // Menu
                const menu = element('div');
                menu.classList.add('menu');
                menu.style.top = (headerHeight + headerBoxShadow) + 'px';
                menu.style.height = 'calc(100% - ' + (headerHeight + headerBoxShadow) + 'px)';
                document.body.append(menu);
                favouriteNodes.updateHeartedNodesList();
            });
        });
    }
};

function element(type) {
    return document.createElement(type);
}

function createHeader(node, page) {
    let clearfix = element('div');
    let nameContainer = element('h2');
    let name = element('span');
    let status = element('section');
    let goBackArea = element('section');
    let goBackButton = element('button');
    clearfix.classList.add('clearfix');
    goBackArea.classList.add('status');
    status.classList.add('status');
    nameContainer.classList.add('node-title');
    name.classList.add('name');
    status.innerHTML = '<h3>Status:</h3>' + humanTimeAgo(node.last_restarted);
    name.innerHTML = node.nickname;
    nameContainer.innerHTML = node.type + ': ';
    nameContainer.appendChild(name);
    goBackButton.classList.add('fakelink');
    goBackButton.innerHTML = "Go back   ";
    goBackButton.onclick = function() {
        main.innerHTML = ' \
        <div id="offlinemsg" style="position: absolute;  font-size: 1.5rem; width: 100%; left: 0px;background: red none repeat scroll 0% 0%;top: -10rem;z-index: 999;text-align: center;padding: 1.75rem 0;overflow: hidden;max-height: 5rem;transition: all ease 2s;"> \
          Error: You are offline, but the next page is not cached and can therefore not be displayed. \
        </div> \
        <div class="offline" id="offline" style="margin-bottom: 2rem;"> \
          <h2>No connection</h2> \
          <div class="content" id="offlinecontent"> \
            <p>There seems to be an issue connecting to the server.</p> \
          </div> \
        </div><table><thead><tr><th>#</th><th>Nickname</th><th>Bandwidth</th><th>Uptime</th><th>Country</th><th>Flags</th><th>Type</th></tr></thead><tbody id="nodeList"></tbody></table> \
        <div class="pagination clearfix"> \
        <button class="prev" id="prev" onclick="lastPage();" style="display:none;background:transparent;border:none;outline:none;color:white;font-size: 3rem;cursor: pointer;"><span class="visually-hidden">Prev</span>‹</button> \
        <button class="next" id="next" onclick="nextPage();" style="background:transparent;border:none;outline:none;color:white;font-size: 3rem;cursor: pointer;"><span class="visually-hidden">Next</span>›</button> \
        </div>';
        if (navigator.onLine) {
            isReachable('https://onionite-test.vercel.app/api/listing/p0').then(function(online) { // this URL is never cached
                if (online) {
                    document.getElementById('offline').style.display = 'none';
                } else {
                    document.getElementById('offline').style.display = '';
                    let currentContent = document.getElementById('offlinecontent').innerHTML;
                    document.getElementById('offlinecontent').innerHTML = currentContent + 'This data is cached from ' + window.cacheDate;
                }
            });
        } else {
            document.getElementById('offline').style.display = '';
        }
        if(page < 2) {
            document.getElementById('prev').style.display = 'none';
        } else {
            document.getElementById('prev').style.display = '';
        }
        console.log(page);
        getNodes('p' + page);
    };
    goBackArea.appendChild(goBackButton);
    clearfix.appendChild(nameContainer);
    clearfix.appendChild(goBackArea);
    clearfix.appendChild(status);
    return clearfix;
}

function createOverview(node) {
    let overview = element('section');
    overview.classList.add('overview')
    overview.innerHTML = '<h3>Overview</h3><i class="icon-tor"></i>';
    let dl = element('dl');
    if(node.nickname) {
        dl.innerHTML += '<dt>Nickname</dt><dd>' + node.nickname + '</dd>';
    }
    if(node.fingerprint) {
        dl.innerHTML += '<dt>Fingerprint</dt><dd>' + node.fingerprint + '</dd>';
    }
    if(node.hashed_fingerprint) {
        dl.innerHTML += '<dt>Hashed Fingerprint</dt><dd>' + node.hashed_fingerprint + '</dd>';
    }
    if(node.advertised_bandwidth) {
        dl.innerHTML += '<dt>Advertised Bandwidth</dt><dd>' + node.advertised_bandwidth + '</dd>';
    }
    if(node.flags && node.flags.length) {
        dl.innerHTML += '<dt>Flags</dt>';
        node.flags.forEach(flag => {
            dl.innerHTML += '<dd class="flag"><i class="icon-' + flag.toLowerCase() + '"></i> ' + flag + '</dd>'
        })
    }
    overview.appendChild(dl);
    return overview;
}

function createBandwidth(node) {
    if(node.bandwidth) {
        let bandwidth = element('section');
        bandwidth.classList.add('bandwidth');
        bandwidth.setAttribute('aria-hidden', 'true');
        bandwidth.innerHTML = '<h3>Bandwidth <small>(MB/s over the last month)</small></h3>';
        let bandwidth2 = element('pre');
        bandwidth2.innerHTML = node.bandwidth;
        bandwidth.appendChild(bandwidth2);
        return bandwidth;
    }
    return element('section');
} 

function createColumns(node) {
    let columns = element('div');
    columns.classList.add("columns");
    let configInfo = element('section');
    configInfo.innerHTML = '<h3>Config</h3>';
    let dl = element('dl');
    if(node.type) {
        dl.innerHTML += '<dt>Type</dt><dd>' + node.type + '</dd>';
    }
    if(node.platform) {
        dl.innerHTML += '<dt>Platform</dt><dd>' + node.platform + '</dd>';
    }
    if(node.or_addresses.length) {
        dl.innerHTML += '<dt>Or Addresses</dt>';
        node.or_addresses.forEach(address => {
            dl.innerHTML += '<dd>' + address + '</dd>';
        });
    }
    if(node.dir_address) {
        dl.innerHTML += '<dt>Dir Address</dt><dd>' + node.dir_address + '</dd>';
    }
    if(node.transports) {
        dl.innerHTML += '<dt>Transport Protocols</dt>';
        node.transports.forEach(transport => {
            dl.innerHTML += '<dd>' + transport + '</dd>';
        });
    }
    if(node.exit_policy.length) {
        dl.innerHTML += '<dt>Exit Policy</dt>';
        node.exit_policy.forEach(rule => {
            dl.innerHTML += '<dd>' + rule + '</dd>';
        });
    }
    configInfo.appendChild(dl);
    columns.appendChild(configInfo);
    let metaInfo = element('section');
    metaInfo.innerHTML = '<h3>Meta</h3>';
    let dl2 = element('dl');
    if(node.host_name) {
        dl2.innerHTML += '<dt>Hostname</dt><dd>' + node.host_name + '</dd>';
    }
    if(node.contact) {
        dl2.innerHTML += '<dt>Contact</dt><dd>' + node.contact + '</dd>';
    }
    if(node.country_name) {
        dl2.innerHTML += '<dt>Country</dt><dd>' + node.country_name + '</dd>';
    }
    if(node.region_name) {
        dl2.innerHTML += '<dt>Region</dt><dd>' + node.region_name + '</dd>';
    }
    if(node.city_name) {
        dl2.innerHTML += '<dt>City</dt><dd>' + node.city_name + '</dd>';
    }
    if(node.as_number) {
        dl2.innerHTML += '<dt>AS number</dt><dd>' + node.as_number + '</dd>';
    }
    if(node.as_name) {
        dl2.innerHTML += '<dt>AS name</dt><dd>' + node.as_name + '</dd>';
    }
    if(node.consensus_weight) {
        dl2.innerHTML += '<dt>Consensus Weight</dt><dd>' + node.consensus_weight + '</dd>';
    }
    if(node.effective_family) {
        dl2.innerHTML += '<dt>Family</dt>';
        node.effective_family.forEach(familyMember => {
            try {
                fetch('https://onionite-test.vercel.app/api/node/' + familyMember)
                .then(response => response.json())
                .then(data => {
                    let familyButton = document.createElement('button');
                    familyButton.classList.add("fakelink");
                    familyButton.innerHTML =  data.node.fingerprint;
                    familyButton.onclick = function() {
                        data.node.bandwidth = data.bandwidth;
                        showNode(data.node, 1);
                    };
                    dl2.appendChild(familyButton);
                });
            } catch {
                // offline
            }
        });
    }
    metaInfo.appendChild(dl2);
    columns.appendChild(metaInfo);
    return columns;
} 

function showNode(node, page) {
    let main = document.getElementById('main');
    main.innerHTML = ' \
    <div id="offlinemsg" style="position: absolute;  font-size: 1.5rem; width: 100%; left: 0px;background: red none repeat scroll 0% 0%;top: -10rem;z-index: 999;text-align: center;padding: 1.75rem 0;overflow: hidden;max-height: 5rem;transition: all ease 2s;"> \
      Error: You are offline, but the next page is not cached and can therefore not be displayed. \
    </div> \
    <div class="offline" id="offline" style="margin-bottom: 2rem;"> \
      <h2>No connection</h2> \
      <div class="content" id="offlinecontent"> \
        <p>There seems to be an issue connecting to the server.</p> \
      </div> \
    </div>';
    if (navigator.onLine) {
        isReachable('https://onionite-test.vercel.app/api/listing/p0').then(function(online) { // this URL is never cached
            if (online) {
                document.getElementById('offline').style.display = 'none';
            } else {
                document.getElementById('offline').style.display = '';
                let currentContent = document.getElementById('offlinecontent').innerHTML;
                document.getElementById('offlinecontent').innerHTML = currentContent + 'This data is cached from ' + window.cacheDate;
            }
        });
    } else {
        document.getElementById('offline').style.display = '';
    }
    main.appendChild(createHeader(node, page));
    main.appendChild(createOverview(node));
    main.appendChild(createBandwidth(node));
    main.appendChild(createColumns(node));
	favouriteNodes.init(node);
}

favouriteNodes.createMenu();