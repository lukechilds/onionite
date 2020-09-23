/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */

const wait = time => new Promise(resolve => setTimeout(resolve, time * 1000))

var currentPage;
var currentSearchPage;
var searching = false;
var searchInput;

function humanTimeAgo(utcDate) {
	const dateNow = Date.now();
	const oldDate = new Date(utcDate);
	const diff = dateNow - oldDate.getTime();
	const uptime = {};

	uptime.s = Math.round(diff / 1000);
	uptime.m = Math.floor(uptime.s / 60);
	uptime.h = Math.floor(uptime.m / 60);
	uptime.d = Math.floor(uptime.h / 24);

	uptime.s %= 60;
	uptime.m %= 60;
	uptime.h %= 24;

	let readableUptime = '';
	readableUptime += uptime.d ? ` ${uptime.d}d` : '';
	readableUptime += uptime.h ? ` ${uptime.h}h` : '';
	if ((!uptime.d || !uptime.h) && uptime.m) {
		readableUptime += ` ${uptime.m}m`;
	}

	return readableUptime.trim();
}

function prettyBytes(number) {
	let exponent;
	let unit;
	const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	if (number < 1) {
		return number + ' B';
	}

	exponent = Math.min(Math.floor(Math.log(number) / Math.log(1024)), units.length - 1);
	number = (number / Math.pow(1024, exponent)).toFixed(2) * 1;
	unit = units[exponent];

	return number + ' ' + unit;
}

function getNodes(code) {
	fetch('https://onionite-test.vercel.app/api/listing/' + code)
  		.then(response => response.json())
		  .then(data => addNodes(data))
		  .catch(error =>  {
			  showOfflineMessage();
			  console.log(error);
		  });
}

function addNodes(nodeList) {
	let i = 1; // i is the number the user sees, and the first node should be displayed as 1, not as 0
	document.getElementById('nodeList').innerHTML = '';
	if(nodeList.length < 10) {
		document.getElementById('next').style.display = 'none';
	} else {
		document.getElementById('next').style.display = '';
	}
	nodeList.forEach(node => {
		if(searching) {
			node.number = (currentSearchPage - 1) * 10 + i;
		} else {
			node.number = (currentPage - 1) * 10 + i;
		}
		nodeInfo = generateNodeInfo(node);
		document.getElementById('nodeList').appendChild(nodeInfo);
		if(i == 10) {
			return;
		}
		i++;
	});
}

function generateNodeInfo(node) {
	infoRow = document.createElement('tr');
	nodeNumber = document.createElement('td');
	nodeNumber.innerHTML = node.number;
	nodeNickname = document.createElement('td');
	nodeNicknameButton = document.createElement('button');
	nodeNicknameButton.classList.add("fakelink");
	nodeNicknameButton.innerHTML =  node.nickname;
	nodeNicknameButton.onclick = function() {
		showNode(node, currentPage);
	};
	nodeNickname.appendChild(nodeNicknameButton);
	nodeBandwidth = document.createElement('td');
	nodeBandwidth.innerHTML = prettyBytes(node.advertised_bandwidth);
	nodeUptime = document.createElement('td');
	nodeUptime.innerHTML = humanTimeAgo(node.last_restarted);
	nodeCountry = document.createElement('td');
	nodeCountry.innerHTML = node.country_name;
	nodeFlags = document.createElement('td');
	if(node.flags.length > 0) {
		node.flags.forEach(flag => {
			flagInfo = document.createElement('i');
			flagInfo.classList.add('icon-' + flag.toLowerCase());
			flagInfo.title = flag;
			flagInfo.innerHTML = '<span class="hidden">' + flag + '</span>';
			nodeFlags.appendChild(flagInfo);
		});
	}
	nodeType = document.createElement('td');
	nodeType.innerHTML = node.type;
	infoRow.appendChild(nodeNumber);
	infoRow.appendChild(nodeNickname);
	infoRow.appendChild(nodeBandwidth);
	infoRow.appendChild(nodeUptime);
	infoRow.appendChild(nodeCountry);
	infoRow.appendChild(nodeFlags);
	infoRow.appendChild(nodeType);
	return infoRow;
}

function getVersion() {
	fetch('https://onionite-test.vercel.app/api/version/version')
  		.then(response => response.text())
  		.then(data => setVersion(data));
}

function setVersion(version) {
	document.querySelector('#version').innerHTML = 'v' + version;
}

function lastPage() {
	if(searching) {
		if(currentSearchPage > 1) {
			currentSearchPage--;
			getNodes('p' + currentSearchPage + ':s' + searchInput);
			if(currentSearchPage == 1) {
				document.getElementById('prev').style.display = 'none';
			}
		}
	} else {
		if(currentPage > 1) {
			currentPage--;
			getNodes('p' + currentPage);
			if(currentPage == 1) {
				document.getElementById('prev').style.display = 'none';
			}
		}
	}
}

function nextPage() {
	if(searching) {
		currentSearchPage++;
		getNodes('p' + currentSearchPage + ':s' + searchInput);
		document.getElementById('prev').style.display = '';
	} else {
		currentPage++;
		getNodes('p' + currentPage);
		document.getElementById('prev').style.display = '';
	}
}

document.addEventListener('DOMContentLoaded', event => {
	handleConnection();
	getVersion();
	getNodes('p1'); // API page counter starts at 1
	currentPage = 1;
}, false);

function searchInputChanged(input) {
	document.getElementById('main').innerHTML = ' \
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
	if(input == '') {
		searching = false;
		getNodes('p' + currentPage);
		if(currentPage == 1) {
			document.getElementById('prev').style.display = 'none';
		} else {
			document.getElementById('prev').style.display = '';
		}
	} else {
		searching = true;
		currentSearchPage = 1;
		searchInput = input;
		getNodes('p' + currentPage + ':s' + input);
		document.getElementById('prev').style.display = 'none';
	}
}

window.addEventListener('online', handleConnection);
window.addEventListener('offline', handleConnection);

function isReachable(url) {
	return fetch(url, { method: 'HEAD', mode: 'no-cors' })
	  .then(response =>  {
		return response && (response.ok || response.type === 'opaque');
	  })
	  .catch(error => {});
  }

function handleConnection() {
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
}

function showOfflineMessage() {
	currentPage--;
	document.getElementById('offlinemsg').style.top = '0';
	wait(2).then(() => {
		document.getElementById('offlinemsg').style.top = '-6rem';
	});
}
