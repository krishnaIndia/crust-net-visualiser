// import { TimeoutError } from "bluebird";

var BASE_URL = location.protocol + '//' + location.host;
var HOST = BASE_URL + location.pathname.split('/').slice(0, -1).join('/') + '/';
var loadingEle = $('#loading');
var inviteCntrClass = 'invite';
var ackInviteClass = 'ack-invite';
var hasInviteClass = 'has-invite';
var manageInviteClass = 'manage-invite';
var inviteURLClass = 'invite-url';
var adminClass = 'admin';
var superAdminClass = 'super-admin';
var TESTNET_SELECTION = 'TESTNET_SELECTION';

var ERROR_CODES = {
  UNAUTHORISED: 401,
  FORBIDDEN: 403
};

function setLoading(state) {
  if (state) {
    loadingEle.addClass('show');
    return;
  }
  loadingEle.removeClass('show');
}

function handleError(err) {
  alert(`Error :: ${err.response.statusText || err.message}`);
  if ([ERROR_CODES.UNAUTHORISED, ERROR_CODES.FORBIDDEN].indexOf(err.response.status) !== -1) {
    return goTo('/');
  }
  setLoading(false);
}

function post(url, data, headers) {
  return axios.post(BASE_URL + url, data, headers ? headers : {}).catch(handleError);
}

function get(url) {
  return axios.get(BASE_URL + url).catch(handleError);
}

function deleteReq(url) {
  return axios.delete(BASE_URL + url).catch(handleError);
}

function goTo(page, toNewPage) {
  var path = location.pathname.split('/').slice(0, -1).join('/');
  if (toNewPage) {
    return window.open(path + page);
  }
  location.assign(path + page);
}

function displayCntr(className, state) {
  var ele = $('.' + className);
  if (!state) {
    $(ele).hide();
    return;
  }
  $(ele).show();
}

function getTestnetFromQuery() {
  if (location.search) {
    var param;
    var tokens = location.search.replace('?', '').split('&');
    for (let i = 0; i < tokens.length; i++) {
      param = tokens[i].split('=');
      if (param[0] === 'testnet') {
        return param[1];
      }
    }
  }
  return '';
}

function getInviteData(token) {
  let url = '/invite/' + token;
  let testnet = getTestnetFromQuery();
  // if (!testnet) {
  //     alert('Testnet parameter is not found. The URL is invalid.');
  //     return;
  // }
  url += ('/' + testnet);
  return get(url);
}

function resetIP(token) {
  let url = '/invite/updateip/';
  // let testnet = getTestnetFromQuery();
  // if (!testnet) {
  //     alert('Testnet parameter is not found. The URL is invalid.');
  //     return;
  // }
  url += ('/' + testnet);
  return post(url, {
    withCredentials: true
  });
}

function getProfile() {
  return get('/profile');
}

function onClickOpenStats() {
  goTo('/stats.html', true);
}

// function onClickUpdateIP() {
//   // var token = $('#copyToken').val();
//   setLoading(true);
//   resetIP()
//     .then(function (res) {
//       alert('Your IP is updated to ' + res.data.ip);
//       setLoading(false);
//       setInvite(res.data.invite, res.data.ip);
//       return res.data.ip;
//     })
//     .then(function (ip) {
//       setLoading(true);
//       return getProfile()
//         .then(function (res) {
//           setLoading(false);
//           setCurrentIp(ip, res.data.cip);
//         }).catch(function (err) {
//           setLoading(false);
//           setCurrentIp(ip, err.cip || err.data.cip);
//         });
//     }).catch(function (err) {
//       setLoading(false);
//       alert('Error : ', err.message);
//     })
// }


function setTestnetTitle() {
  var title = "SAFE Network - CRUST Test";
  $('#testnetTitle').html(title);
}

function setUpdateIpPage() {
  // setTestnetTitle();
  setIpDetails();
};

function getUserData() {
  var url = "/api/profile";
  return get(url);
}

function setIpDetails() {
  setLoading(true);
  getUserData()
    .then(function (res) {
      setLoading(false);
      setCurrentIp(res.data.ip, res.data.cip);
    }).catch(e => console.error(e));
}


function updateIp() {
  let url = '/api/updateIp';
  return get(url);
}

function onClickUpdateIP() {
  setLoading(true);
  updateIp()
    .then(function (res) {
      setIpDetails();
      setLoading(false);
      alert("IP Updated");
    }).catch(function (err) {
      setLoading(false);
      alert('Error : ', err.message);
    })
}

function setCurrentIp(ip, cip) {
  $('#inviteIP').html(ip || 'not set');
  $('#currentInviteIP').html(cip || 'not set');
  var downloadApps = $('#downloadApps');
  var updateIpBtn = $('#updateIp');
  if (!ip) {
    updateIpBtn.html('Set Registered IP')
  }
  var isIPEqual = (ip === cip);
  updateIpBtn.prop('disabled', isIPEqual);
  if(!(ip && isIPEqual)) {
    downloadApps.hide();
  } else {
    downloadApps.show();
  }
}

var parsedURL = new URL(location.href);
var toRedirect = JSON.parse(parsedURL.searchParams.get('auto_redirect'));

var displayInvitePage = function (invite, ip) {
  setLoading(false);
  displayCntr(inviteCntrClass, true);
  displayCntr(hasInviteClass, true);
  setInvite(invite, ip);
};

function setAuthResponse() {
  setTestnetTitle();
  var parsedURL = new URL(location.href);
  var info = parsedURL.searchParams.get('info');
  var err = parsedURL.searchParams.get('err');
  // var role = parsedURL.searchParams.get('role');
  // role = role ? role.toLowerCase() : role;

  var baseEle = $('#authRes');
  var infoEle = baseEle.children('.info-b');
  var errEle = baseEle.children('.error-b');
  // displayCntr(manageInviteClass, false);
  $(baseEle).removeClass('error');
  if (info) {
    $(infoEle).html(info);
  } else if (err) {
    $(baseEle).addClass('error');
    $(errEle).html(err);
  } else {
    goTo('/404.html');
  }

  // setLoading(true);
  // getProfile()
  //   .then(function (res) {
  //     setLoading(false);
  //     var role = res.data.role ? res.data.role.toLowerCase() : null;
  //     if ((role === ROLES.ADMIN) || (role === ROLES.SUPER_ADMIN)) {
  //       displayCntr(manageInviteClass, true);
  //     }
  //   });
}

function trimInvite(invite) {
  return invite.substr(0, 4) + '...' + invite.substr(-4);
}

function selectTestnet(ele) {
  var testnet = ele.dataset.name;
  if (!testnet) {
    return;
  }
  storeTestnetSelection(testnet);
  goTo('/testnet/' + testnet);
}

function setTestnetList(list) {
  var ele = $('#testnetList');
  ele.html('');
  for (var i = 0; i < list.length; i++) {
    ele.append('<li data-name="' + list[i] + '" onclick="selectTestnet(this)">' + list[i] + '</li>');
  }
}

$(function () {
  var page = location.pathname.split('/').slice(-1).toString();
  switch (page) {
    case 'update_ip.html':
      setUpdateIpPage();
      break;
    case 'error.html':
      setAuthResponse();
      break;
    default:
      goTo('/404.html');
      break;
  }
});
