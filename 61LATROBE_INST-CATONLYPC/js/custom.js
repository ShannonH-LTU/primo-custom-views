(function(){
  "use strict";
  'use strict';
  
  var app = angular.module('viewCustom', ['angularLoad']);
  
  console.log('LATROBE view version 0.1.22');
  //console.log('includes: LibChat, Browzine, Talis (v2), guided tours');
  
  /* -------------------------------------------
  / LibChat integration
  ------------------------------------------- */
  angular.module('chat', ['angularLoad'])
    .component('addChat', {
      controller: ['angularLoad', function(angularLoad) {
        this.$onInit = function() {
          angularLoad.loadScript('https://latrobe.libanswers.com/load_chat.php?hash=18578295f317837477f054d32b1e7b01');
        }
      }]
    })
  app.component('prmExploreFooterAfter', {
    template: '<add-chat></add-chat>'
  })
  app.requires.push('chat');
  // ------------------------------------------- end LibChat integration
  
  
  /* -------------------------------------------
  / Browzine integration
  ------------------------------------------- */
  app.controller('SearchResultAvailabilityLineAfterController', [function () {
    var vm = this;
  }]);
  
  app.component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'SearchResultAvailabilityLineAfterController',
    template: '\n    <primo-browzine parent-ctrl="$ctrl.parentCtrl"></primo-browzine>\n'
  
  });
  
  PrimoBrowzineController.$inject = ["$scope"];
  
  function isBrowzineLoaded() {
    var validation = false;
    var scripts = document.head.querySelectorAll("script");
  
    if (scripts) {
      Array.prototype.forEach.call(scripts, function (script) {
        if (script.src.indexOf("browzine-primo-adapter") > -1) {
          validation = true;
        }
      });
    }
  
    return validation;
  };
  
  function PrimoBrowzineController($scope) {
    if (!isBrowzineLoaded()) {
      window.browzine = {
        libraryId: "889",
        apiKey: "a8d9b1e9-fda2-4043-9e64-08f7bbc85754",
  
        journalCoverImagesEnabled: true,
  
        journalBrowZineWebLinkTextEnabled: true,
        journalBrowZineWebLinkText: "View Journal Contents",
  
        articleBrowZineWebLinkTextEnabled: true,
        articleBrowZineWebLinkText: "View Issue Contents",
  
        articlePDFDownloadLinkEnabled: true,
        articlePDFDownloadLinkText: "Download PDF",
  
        articleLinkEnabled: true,
        articleLinkText: "Read Article",
  
        printRecordsIntegrationEnabled: true,
  
        unpaywallEmailAddressKey: "ltu-library@latrobe.edu.au",
  
        articlePDFDownloadViaUnpaywallEnabled: true,
        articlePDFDownloadViaUnpaywallText: "Download PDF (via Unpaywall)",
  
        articleLinkViaUnpaywallEnabled: true,
        articleLinkViaUnpaywallText: "Read Article (via Unpaywall)",
  
        articleAcceptedManuscriptPDFViaUnpaywallEnabled: true,
        articleAcceptedManuscriptPDFViaUnpaywallText: "Download PDF (Accepted Manuscript via Unpaywall)",
  
        articleAcceptedManuscriptArticleLinkViaUnpaywallEnabled: true,
        articleAcceptedManuscriptArticleLinkViaUnpaywallText: "Read Article (Accepted Manuscript via Unpaywall)"
      };
  
      window.browzine.script = document.createElement("script");
      window.browzine.script.src = "https://s3.amazonaws.com/browzine-adapters/primo/browzine-primo-adapter.js";
      window.document.head.appendChild(window.browzine.script);
    }
  
    (function poll() {
      if (isBrowzineLoaded() && window.browzine.primo) {
        window.browzine.primo.searchResult($scope);
      } else {
        requestAnimationFrame(poll);
      }
    })();
  };
  
  var PrimoBrowzineComponent = {
    selector: "primoBrowzine",
    controller: PrimoBrowzineController,
    bindings: { parentCtrl: "<" }
  };
  
  var PrimoBrowzineModule = angular.module("primoBrowzine", []).component(PrimoBrowzineComponent.selector, PrimoBrowzineComponent).name;
  
  app.requires.push(PrimoBrowzineModule);
  // ------------------------------------------- end Browzine integration
  
  
  /* -------------------------------------------
  / Talis reading list integration (v2)
  / Based on https://github.com/uqlibrary/exlibris-primo/blob/master/src/view_package/js/custom.js
  ------------------------------------------- */
  app.constant('AspireTrustBaseUrl', "https://latrobe.rl.talis.com/")
    .config([
      '$sceDelegateProvider', 
      'AspireTrustBaseUrl', 
      function($sceDelegateProvider, AspireTrustBaseUrl) {
        var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
        urlWhitelist.push(AspireTrustBaseUrl + '**');
        $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
      }
    ]);
  
  function isFullDisplayPage() {
    return window.location.pathname.includes("fulldisplay");
  }
  
  function getListTalisUrls(item) {
    const TALIS_DOMAIN = "https://latrobe.rl.talis.com/"; // AspireTrustBaseUrl
    const list = [];
    // need to restrict a new type and don't know the exact name? Get an example url for the type and put a debug
    // stop in the browser Source Inspection in getListTalisUrls, and check what is found at
    // Local > item > pnx > type in the variable Scope
    const materialType = !!item?.pnx?.display?.type && item.pnx.display.type[0];
    const restrictedCheckList = [
      "article",
      "book_chapter",
      "conference_paper",
      "conference_proceeding",
      "design",
      ///"government_document",
      ///"magazinearticle", // Primo currently using a non-standard format
      ///"magazine_article", // future-proof it
      "market_research",
      ///"newsletterarticle", // Primo currently using a non-standard format
      ///"newsletter_article", // future-proof it
      "newspaper_article",
      "patent",
      "questionnaire",
      "report",
      "review",
      ///"web_resource",
      "working_paper",
    ];
    const isRestrictedCheckType = restrictedCheckList.includes(materialType);
  
    // LCN
    if (!!item?.pnx?.search?.addsrcrecordid && item.pnx.search.addsrcrecordid.length > 0) {
      item.pnx.search.addsrcrecordid.forEach(r => {
        list.push(TALIS_DOMAIN + 'lcn/' + r + '/lists.json');
      })
    }
  
    // DOI
    if (!!item?.pnx?.addata?.doi && item.pnx.addata.doi.length > 0) {
      item.pnx.addata.doi.forEach(r => {
        list.push(TALIS_DOMAIN + 'doi/' + r + '/lists.json');
      })
    }

    // check if the identifier is actually a DOI (as has been observed for some theses)
    if (!!item?.pnx?.display?.identifier && item.pnx.display.identifier.length == 1) {
      // single identifier, so if it looks like a DOI, use that
      var ident = item.pnx.display.identifier[0];
      if(ident.indexOf('10.') == 0) {
        list.push(TALIS_DOMAIN + 'doi/' + ident + '/lists.json');
      }
    }    
  
    // EISBN
    if (!isRestrictedCheckType && !!item?.pnx?.addata?.eisbn && item.pnx.addata.eisbn.length > 0) {
      item.pnx.addata.eisbn.forEach(r => {
        const isbn = r.replace(/[^0-9X]+/gi, '');
        [10, 13].includes(isbn.length) && list.push(TALIS_DOMAIN + 'eisbn/' + isbn + '/lists.json');
      })
    }
  
    // ISBN
    if (!isRestrictedCheckType && !!item?.pnx?.addata?.isbn && item.pnx.addata.isbn.length > 0) {
      item.pnx.addata.isbn.forEach(r => {
        const isbn = r.replace(/[^0-9X]+/gi, '');
        [10, 13].includes(isbn.length) && list.push(TALIS_DOMAIN + 'isbn/' + isbn + '/lists.json');
      })
    }
  
    // EISSN
    if (!isRestrictedCheckType && !!item?.pnx?.addata?.eissn && item.pnx.addata.eissn.length > 0) {
      item.pnx.addata.eissn.forEach(r => {
        list.push(TALIS_DOMAIN + 'eissn/' + r + '/lists.json');
      })
    }
  
    // ISSN
    if (!isRestrictedCheckType && !!item?.pnx?.addata?.issn && item.pnx.addata.issn.length > 0) {
      item.pnx.addata.issn.forEach(r => {
        list.push(TALIS_DOMAIN + 'issn/' + r + '/lists.json');
      })
    }
  
    return list;
  }
  
  app.component('prmServiceDetailsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'DisplayTalisListsController',
    template: 
      '<div class="reading-lists" ng-if="totalCourses > 0">' +
        '<div layout="row" layout-xs="column">' +
          '<div flex-gt-sm="20" flex-gt-xs="25" flex="">' +
            '<span class="bold-text word-break" title="Reading lists">Included in {{totalCourses}} reading list{{totalCourses == 1 ? "" : "s"}}:</span>' +
            '<a ng-if="totalCourses > 3" class="accessible-only skip-option" href="#afterRL" onclick="location.hash=\'\';">Skip over reading lists</a>' +
          '</div>' +

          '<div class="item-details-element-container" flex="">' +
            '<div role="list" class="reading-lists-wrapper item-details-element" ng-switch="totalCourses">' +
              '<div ng-switch-when="1">' +
                '<span ng-repeat="(url,listname) in talisCourses">' +
                  '<a href="{{url}}" target="_blank">{{listname}}</a>' +
                '</span>' +
              '</div>' +
              '<ul ng-switch-default>' +
                '<li ng-repeat="(url,listname) in talisCourses">' +
                  '<a href="{{url}}" target="_blank">{{listname}}</a>' +
                '</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +        
        '<span ng-if="totalCourses > 3" id="afterRL"></span>' +
      '</div>'
  });
  
  app.controller('DisplayTalisListsController', function($scope, $http) {
    var vm = this;
    
    this.$onInit = function () {
      $scope.talisCourses = [];
      $scope.totalCourses = 0;
  
      if (!isFullDisplayPage()) {
        return;
      }
  
      let courseList = {}; // associative arrays are done in js as objects
  
      async function getTalisDataFromAllApiCalls(listUrls) {
        const listUrlsToCall = listUrls.filter(url => url.startsWith('http'))
        const promiseList = listUrlsToCall.map(url => $http.jsonp(url, {jsonpCallbackParam: 'cb'}));
        // get all the urls then sort them into a non-repeating list
        await Promise.allSettled(promiseList)
          .then(response => {
            response.forEach(r => {
              if (!r.status || r.status !== 'fulfilled' || !r.value || !r.value.data) {
                return;
              }
              for (let talisUrl in r.value.data) {
                const subjectCode = r.value.data[talisUrl];
                !courseList[talisUrl] && (courseList[talisUrl] = subjectCode);
              }
            });
          })
          .finally(() => {
            if (Object.keys(courseList).length > 0) {
              const recordid = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg Almalu51268459680002146
              
              $scope.talisCourses = {};
              var totalTestCourses = 0;
              // sort by course code for display
              let sortable = [];
              for (let talisUrl in courseList) {
                const subjectCode = courseList[talisUrl];
                sortable.push([talisUrl, subjectCode]);
              }
              sortable.sort(function(a, b) {
                return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
              });
              sortable.forEach((entry) => {
                const subjectCode = entry[1];
                const talisUrl = entry[0];

                // exclude any list with '[TEST LIST]' or '[RETIRED]' in its name
                if(subjectCode.toLowerCase().indexOf("[test list]") == -1 && subjectCode.toLowerCase().indexOf("[retired]") == -1) $scope.talisCourses[talisUrl] = subjectCode;
                else totalTestCourses++;
              });

              $scope.totalCourses = sortable.length - totalTestCourses;
            }
          });
      }
  
      const listTalisUrls = vm?.parentCtrl?.item && getListTalisUrls(vm.parentCtrl.item);
      if (!!listTalisUrls && listTalisUrls.length > 0) {
        getTalisDataFromAllApiCalls(listTalisUrls);
      }
    };
  });
  // ------------------------------------------- end Talis reading list integration (v2)


  /* -------------------------------------------
  / Google Analytics
  ------------------------------------------- */
  // add the GA4 script to the <head>
  var ga4Script = document.createElement("script");
  ga4Script.src = "https://www.googletagmanager.com/gtag/js?id=G-DZJSBPP4TG";
  window.document.head.appendChild(ga4Script);

  // add the GTAG function to the <body>
  var gtagScript = document.createElement("script");
  var scriptText = "window.dataLayer = window.dataLayer || []; "+
    "function gtag(){dataLayer.push(arguments);}"+
    "gtag('js', new Date());"+
    "gtag('config', 'G-DZJSBPP4TG');";
  gtagScript.innerHTML = scriptText;
  window.document.body.insertBefore(gtagScript, window.document.body.firstChild);  
  // ------------------------------------------- end Google Analytics



  /* -------------------------------------------
  / Scaling iframes' height to match their responsive width
  /
  / If an iframe has the class 'maintain-aspect-ratio', the width & height attributes will determine its aspect ratio.
  / If an iframe has the attribute 'data-aspect-ratio', that aspect ratio is used.
  / If an iframe has the attribute 'data-aspect-ratio-offset', that value is added to the height calculated by the ratio.
  ------------------------------------------- */
  window.onresize = function() {
    var iframes = angular.element(document).find('iframe');  
    angular.forEach(iframes, function(el){
        var iframe = angular.element(el);

        var iRatio;
        if(iframe.hasClass('maintain-aspect-ratio')) {
            var iWidth = parseInt(iframe.attr('width'));
            var iHeight = parseInt(iframe.attr('height'));
            
            iRatio = (iWidth && iHeight > 0) ? iWidth / iHeight : NaN;
        } else {
            iRatio = parseFloat(iframe.attr('data-aspect-ratio'));
        }

        if(iRatio) {
            var actualWidth = iframe[0].offsetWidth;
            
            var newHeight = actualWidth / iRatio;
            
            var arOffset = parseInt(iframe.attr('data-aspect-ratio-offset'));
            if(arOffset) newHeight += arOffset;

            iframe.css('height', newHeight+'px');
        }
    });
  }
  // ------------------------------------------- end scaling iframes' height


  /* -------------------------------------------
  / Gallery collection - Author & Date
  ------------------------------------------- */
  app.component('prmGalleryItemAfter', {
      bindings: {
        parentCtrl: '<'
      },
      controller: function () {
        var $ctrl = this;
        $ctrl.$onInit = function () {
          try {
            $ctrl.author = $ctrl.parentCtrl.item.pnx.addata.au[0];
          } catch (e) {
            $ctrl.author = '';
          }
          try {
            $ctrl.date = $ctrl.parentCtrl.item.pnx.display.creationdate[0];
          } catch (e) {
            $ctrl.date ='';
          }
          $ctrl.hasDate = !!$ctrl.date;
          $ctrl.hasAuthor = !!$ctrl.author;
        };
      },
      template: '<div class="item-date" ng-if="$ctrl.hasDate">{{$ctrl.date}}</div>'+
                '<div class="item-author" ng-if="$ctrl.hasAuthor">{{$ctrl.author}}</div>',
      });
  // ------------------------------------------- end Gallery collection - Author & Date


  /* -------------------------------------------
  / Availability facet counts
  /
  / Adapted from: https://github.com/alliance-pcsg/ve-central-package
  ------------------------------------------- */
  angular
    .module('availabilityCounts', [])
    .component('availabilityCounts', {
      controller: function ($scope, availabilityCountsOptions) {

        var avail_group = 'tlevel';

        this.$onInit = function () {
          var parent_ctrl = $scope.$parent.$parent.$ctrl;
          this.facet_group = parent_ctrl.facetGroup.name;
          this.facet_results = parent_ctrl.facetService.results;
          if (this.facet_group == avail_group) {
            this.processFacets();
          }
          // copy options from local package or central package defaults
          this.msg = availabilityCountsOptions.msg;
        }

        this.processFacets = function () {
          var self = this;
          if (!self.msg) self.msg = '';

          angular.forEach(self.facet_results, function (result) {
            if (result.name == avail_group) {
              var first_value = result.values[0].value;
              var interval = setInterval(find_facet, 100);
              function find_facet() {
                if (document.querySelector(self.getSelector(first_value))) {

                  // Clear interval
                  clearInterval(interval);

                  // Add availability counts as spans
                  angular.forEach(result.values, function (facet) {
                    var selector = self.getSelector(facet.value);
                    if (document.querySelector(selector)) {
                      var facet_item = document.querySelector(selector);
                      if (facet_item.querySelector('.facet-counter') == null) {
                        var facet_text = facet_item.querySelector('.text-number-space');
                        var span = document.createElement('span');
                        var count = document.createTextNode(facet.count.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (self.msg != '' ? '*' : ''));
                        span.setAttribute('class', 'text-italic text-in-brackets text-rtl facet-counter');
                        span.appendChild(count);
                        facet_text.after(span);
                      }
                    }
                  });

                  // Facets are created and destroyed in the DOM when the group is toggled so watch for clicks
                  var availGroup = document.querySelector(self.getSelector(avail_group));
                  availGroup.addEventListener('click', function () {
                    self.processFacets();
                  });

                  // Add warning text (unless it's blank)
                  if (!availGroup.querySelector('.section-content .warning') && self.msg != '') {
                    var warning = document.createElement('span');
                    var warningText = document.createTextNode(self.msg);
                    warning.setAttribute('class', 'warning');
                    warning.appendChild(warningText);
                    availGroup.querySelector('.section-content').appendChild(warning);
                  }
                }
              }
            }
          });
        }

        this.getSelector = function (value) {
          if (value == avail_group) {
            return 'div[data-facet-group="' + avail_group + '"]';
          }
          else {
            return 'div[data-facet-value="' + avail_group + '-' + value + '"]';
          }
        }

      }
    })
    // Set values for options
    .value('availabilityCountsOptions', {
      msg: ''  // warning message (shown under facets)
    });  
  app.component('prmFacetExactAfter', {
    template: '<availability-counts></availability-counts>'
  });
  app.requires.push('availabilityCounts');
  // ------------------------------------------- end Availability facet counts


})();
