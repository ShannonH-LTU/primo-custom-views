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
  / Guided tour integration
  ------------------------------------------- */
  app.component('prmTopbarAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'GuidedTourController',
    template: 
      '<a id="tour_button" href="" ng-show="tourLabel" ng-click="startTour()" ng-class="[{\'animate\':animateButton, \'show\':tourLabel}, tourClass]">'+
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" style="margin: 0 5px 0 0;font-size: 1.1em;max-width: 18px;"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M224 32H64C46.3 32 32 46.3 32 64v64c0 17.7 14.3 32 32 32H441.4c4.2 0 8.3-1.7 11.3-4.7l48-48c6.2-6.2 6.2-16.4 0-22.6l-48-48c-3-3-7.1-4.7-11.3-4.7H288c0-17.7-14.3-32-32-32s-32 14.3-32 32zM480 256c0-17.7-14.3-32-32-32H288V192H224v32H70.6c-4.2 0-8.3 1.7-11.3 4.7l-48 48c-6.2 6.2-6.2 16.4 0 22.6l48 48c3 3 7.1 4.7 11.3 4.7H448c17.7 0 32-14.3 32-32V256zM288 480V384H224v96c0 17.7 14.3 32 32 32s32-14.3 32-32z"></path></svg>'+
        '<span ng-bind-html="tourLabel"></span>'+
      '</a>'
  });

  app.controller('GuidedTourController', function($scope, $rootScope, $timeout, angularLoad) {
    this.$onInit = function () {
      $scope.driverObj;
      $scope.tourLabel;
      $scope.tourClass = '';
      $scope.tourType = '';
      $scope.stepsTaken = '';
      $scope.tourStartTime;
      $scope.tourSteps;
      $scope.advSearchTourSteps;
      $scope.animateButton;
      $scope.timer;

      if(!window.driver?.js?.driver) {
        // load driverJS
        angularLoad.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/driver.js/1.3.1/driver.css')
        angularLoad.loadScript('https://cdnjs.cloudflare.com/ajax/libs/driver.js/1.3.1/driver.js.iife.js')
          .then(function() {
            // set up the guided tour
            $scope.setupGuidedTour();
          })
      } else {
        // driverJS already loaded, so just set it up
        $scope.setupGuidedTour();
      }
    };

    $scope.setupGuidedTour = function() {
      $scope.driverObj = window.driver.js.driver({
        animate: false,
        disableActiveInteraction: true,
        popoverClass: 'ltu-tour',
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        prevBtnText: "Previous",
        doneBtnText: "Done",
        onHighlighted: function(element, step, options) {
          //console.log('GT - onHighlighted');

          // add this step to the record of steps taken
          if($scope.stepsTaken != '') $scope.stepsTaken += ',';
          $scope.stepsTaken += options.state.activeIndex;

          // track in GA4
          gtag("event", "guided_tour_step", {
            tour_label: $scope.tourLabel.replaceAll('<strong>','').replaceAll('</strong>',''),
            tour_type: $scope.tourType,
            steps_taken: $scope.stepsTaken,
            step_title: step.popover.title,
            step_index: options.state.activeIndex,
            step_element: step.element,
            page_location: window.location.href
          });
        },
        onDestroyStarted: function(element, step, options) {
          //console.log('GT - onDestroyStarted');

          var endTime = Date.now();
          var duration = (endTime - $scope.tourStartTime) / 1000; // in seconds
          
          // track in GA4
          gtag("event", "guided_tour_exited", {
            tour_label: $scope.tourLabel.replaceAll('<strong>','').replaceAll('</strong>',''),
            tour_type: $scope.tourType,
            tour_duration: duration,
            steps_taken: $scope.stepsTaken,
            step_title: step.popover.title,
            step_index: options.state.activeIndex,
            step_element: step.element,
            page_location: window.location.href
          });

          // actually destroy the tour
          $scope.driverObj.destroy();
        }
      });

      // listen for the location change event
      $scope.$on('$locationChangeStart', function(event, next, current) {
        console.log('locationChangeStart - next: '+next);
        
        // update the tour for the new content
        $scope.updateTour(next);
      });

      // update the tour for the initial page content 
      $scope.updateTour();
    }

    $scope.startTour = function(initialStep = 0) {
      // start the tour (removing any active ones)
      if($scope.driverObj && $scope.tourSteps) {
        //console.log('GT - START TOUR: '+$scope.tourLabel);
        
        // clear any existing tour
        $scope.driverObj.destroy();
        
        // clear the record of steps taken
        $scope.stepsTaken = '';

        // set the type of tour (i.e. general or advanced search)
        $scope.tourType = 'general';

        // record the time the tour started
        $scope.tourStartTime = Date.now();

        // track in GA4
        gtag("event", "guided_tour_started", {
          tour_label: $scope.tourLabel.replaceAll('<strong>','').replaceAll('</strong>',''),
          tour_type: $scope.tourType,
          page_location: window.location.href
        });

        // start the tour
        $scope.driverObj.setSteps($scope.tourSteps);
        $scope.driverObj.drive(initialStep);
      }
    }

    $scope.updateTour = function(url) {
      if(!url) url = window.location.href;
      
      if(!window.driver?.js?.driver) {
        console.log('DriverJS not defined');
        return;
      }

      // flag whether the tour button should animate down into position
      $scope.animateButton = false;

      $scope.tourClass = '';

      // check whether Primo is showing its 'mobile' (xs) view
      var isMobileView = document.querySelector('primo-explore.__xs') != null;
      var isSmallView = document.querySelector('primo-explore.__sm') != null;

      // time (in ms) to allow for the menu to open/close when navigating to next/prev step
      var menuDelay = 200;
      
      // check which page we're on
      if(/\/search\?/.test(url)) {
        // standard search
        
        if(/query/.test(url)) {
          // results view
          $scope.tourLabel = 'Tour the <strong>Library collections</strong> search results page';

          var advSearchUrl = url.replace('&mode=simple', '').replace('&mode=advanced', '').replace('&startTour=1', '') + '&mode=advanced';

          $scope.tourSteps = [
            {
              element: "prm-brief-result-container",
              popover: {
                title: "Library collections search results",
                description: "The results of your library collections search are listed on the page. Select an item from the results to see its details.",
                showButtons: ["next", "close"],
                side: "bottom",
                align: "center"
              }
            }, {
              element: ".result-item-actions prm-save-to-favorites-button",
              popover: {
                title: "Save to favourites",
                description: "You can save an item to your favourites to make it easier to find again.",
                side: "right",
                align: "center"
              }
            },
            // FOLLOWING ELEMENTS ARE DIFFERENT DEPENDING ON THE VIEW
            {
              element: isMobileView ? null : ".result-item-actions button[data-qa='open_up_front_Citation_action']",
              popover: {
                title: "View citation formats",
                description: "If you need to cite an item in your work, you can select its citation button to view its details in various standard reference formats.",
                side: "right",
                align: "center"
              }
            }, {
              element: isMobileView || isSmallView ? "#mobilePersonalization" : "#personalizationBtn",
              popover: {
                title: "Personalise your results",
                description: "You can specify your preferred disciplines to have relevant items listed higher in the search results.",
                side: "right",
                align: "center"
              }
            }, {
              element: isMobileView || isSmallView ? "#sidebar-trigger" : "prm-facet:has(.sidebar-section)",
              popover: {
                title: "Narrow your results",
                description: "Apply filters (such as 'Peer-reviewed' and 'Resource type') to narrow down your search. You can also 'Search beyond our collection' to include results from other libraries.",
                side: "top",
                align: isMobileView ? "end" : "start"
              }
            }, 
            // FOLLOWING ELEMENTS ARE ON THE PAGE
            {
              element: "prm-newspapers-spotlight",
              popover: {
                title: "Search newspaper articles",
                description: "A standard library search doesn't include newspaper articles. If you would like to search newspapers, you can select this link.",
                side: "top",
                align: "center",
              }
            }, {
              element: ".search-wrapper",
              popover: {
                title: "Search form",
                description: "If you didn't get the results that you were after, try a new search. You can always add more search parameters using an <a href='"+advSearchUrl+"'>Advanced search</a>.",
                side: "bottom",
                align: "center"
              }
            }, {
              element: ".s-lch-widget-float-btn",
              popover: {
                title: "Need help?",
                description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
                side: "bottom",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS EITHER IN MENU OR ON THE PAGE
            {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
              popover: {
                title: "Ran into an issue?",
                description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
                side: "right",
                align: "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the previous element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                },
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the next element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS ON THE PAGE
            {
              element: "#logoImage",
              popover: {
                title: "Library website",
                description: "To return to the library website, select the La Trobe University logo.",
                side: "bottom",
                align: "start",
                popoverClass: 'ltu-tour ltu-end-tour',
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                }
              }
            }]
        } else {
          $scope.tourLabel = "Tour the <strong>Library collections</strong> search page";

          $scope.tourSteps = [
            { 
              popover: { 
                  title: "Welcome to the Library collections search", 
                  description: "This search allows you to find any resource within the library's many collections.",
                  showButtons: ["next", "close"],
                  popoverClass: 'ltu-tour ltu-begin-tour'
              }
            },
            // FOLLOWING ELEMENT IS DIFFERENT DEPENDING ON THE VIEW
            {
              element: isMobileView ? "prm-topbar button.mobile-menu-button" : "#more-links-button",
              popover: {
                title: "Check the menu",
                description: "<p>The main menu lets you change the type of search you're performing (e.g. search all collections, databases, or newspaper articles) as well as allowing you to request items from another library.</p><p>Select the '3-dot' menu item to view the full main menu.</p><p>Note that when you're in 'mobile' view, some options that are usually on the page (e.g. the 'Advanced search') are within this menu instead.</p>",
                side: "bottom",
                align: "end",
                popoverClass: 'ltu-tour ltu-tour-wide'
              }
            }, {
              element: ".search-elements-wrapper",
              popover: {
                title: "Search form",
                description: "<p>Enter the term that you want to search for. Use the drop-downs to apply filters to your search.</p><p>You can also 'Search by voice' in supported web browsers (Chrome or Edge are recommended).</p>",
                side: "bottom",
                align: "center"
              }
            }, {
              element: "md-select[aria-label='selectScope']",
              popover: {
                title: "Online or physical?",
                description: "<p>If you would like to restrict your search to only online resources or only physical ones, select the appropriate option in this drop-down.</p>",
                side: "bottom",
                align: "center"
              }
            }, {
              element: "prm-pre-filters > div > md-input-container:nth-child(1) md-select",
              popover: {
                title: "Resource type",
                description: "<p>You can specify the type of resource you're searching for using this drop-down. You will also be able to apply additional filters after performing a search.</p>",
                side: "bottom",
                align: "start"
              }
            }, {
              element: "prm-pre-filters > div > md-input-container:nth-child(3) md-select",
              popover: {
                title: "Search field",
                description: "<p>If you want to search only within a specific field, you can specify it in this drop-down. Leave it as 'anywhere in the record' to broaden your search.</p>",
                side: "bottom",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay);
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENTS ARE EITHER IN MENU OR ON THE PAGE
            {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='label.advanced_search'])" : ".search-switch-buttons button",
              popover: {
                title: "Need more search fields?",
                description: "Switch between a simple search and an advanced search that lets you specify more filters and criteria.",
                side: "bottom",
                align: isMobileView ? "start" : "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the previous element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                }
              }
            }, {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='nui.menu.librarycard'])" : "prm-user-area-expandable",
              popover: {
                title: "Your library account",
                description: "Sign in to access your library account, where you can view the status of any loans or requests for library resources.",
                side: "bottom",
                align: isMobileView ? "start" : "end",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the next element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENTS ARE ON THE PAGE
            {
              element: "#favorites-button",
              popover: {
                title: "View your favourites",
                description: "If you have saved any items or searches to your favourites, you can view them via this button.",
                side: "bottom",
                align: "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the previous element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);    
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }            
                }
              }
            }, {
              element: ".s-lch-widget-float-btn",
              popover: {
                title: "Need help?",
                description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
                side: "bottom",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENTS ARE EITHER IN MENU OR ON THE PAGE
            {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
              popover: {
                title: "Ran into an issue?",
                description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
                side: "right",
                align: "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the previous element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                },
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the next element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENTS ARE ON THE PAGE
            {
              element: "#logoImage",
              popover: {
                title: "Library website",
                description: "To return to the library website, select the La Trobe University logo.",
                side: "bottom",
                align: "start",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                }
              }
            }, {
              element: "#tour_button",
              popover: {
                title: "That's all for now",
                description: "Thanks for taking the tour. You can restart it at any time from here.",
                side: "bottom",
                align: "end",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }        
          ]
        }
      } else if(/\/dbsearch\?/.test(url)) {
        // database search
        
        if(/query/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Databases</strong> search results page';

          var stdSearchUrl = url.replace('/dbsearch', '/search').replace('&tab=jsearch_slot','').replace('&startTour=1', '') + '&facet=rtype,include,Databases';

          $scope.tourSteps = [
            {
              element: "prm-brief-result-container",
              popover: {
                title: "Search results",
                description: "The results of your search are listed on the page. Select an item from the results to see its details.",
                showButtons: ["next", "close"],
                side: "top",
                align: "center"
              }
            }, {
              element: ".result-item-actions prm-save-to-favorites-button",
              popover: {
                title: "Save to favourites",
                description: "You can save an item to your favourites to make it easier to find again.",
                side: "right",
                align: "center"
              }
            }, {
              element: isMobileView ? null : ".result-item-actions button[data-qa='open_up_front_Citation_action']",
              popover: {
                title: "View citation formats",
                description: "If you need to cite an item in your work, you can select its citation button to view its details in various standard reference formats.",
                side: "right",
                align: "center"
              }
            }, {
              element: "prm-alert-bar:has(prm-authentication)",
              popover: {
                title: "Sign in",
                description: "You may need to be signed in to view some databases.",
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-resource-recommender:not(.ng-hide)",
              popover: {
                title: "Suggested databases",
                description: "You may be presented with suggestions for other databases that could provide relevant resources.",
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-atoz-search-bar .layout-row[role='search'] > .layout-column",
              popover: {
                title: "Search form",
                description: "<p>If you didn't get the results that you were after, try a new search term or select a letter/number to search databases whose name begins with that character.</p><p>You can also try searching the <a href='"+stdSearchUrl+"'>library collections</a>, which will allow you to apply filters to narrow down your results.</p>",
                side: "bottom",
                align: "center"
              }
            }, {
              element: isMobileView || isSmallView ? "button:has([translate='nui.dbcategories.mobileCategories'])" : ".databases-categories",
              popover: {
                title: "Database categories",
                description: "You can browse categories to see a list of relevant databases. Select the arrow next to a category to see any sub-categories.",
                side: "top",
                align: "start"
              }
            }, {
              element: ".s-lch-widget-float-btn",
              popover: {
                title: "Need help?",
                description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
                side: "bottom",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS EITHER IN MENU OR ON THE PAGE
            {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
              popover: {
                title: "Ran into an issue?",
                description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
                side: "right",
                align: "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the previous element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                },
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the next element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS ON THE PAGE
            {
              element: "#logoImage",
              popover: {
                title: "Library website",
                description: "To return to the library website, select the La Trobe University logo.",
                side: "bottom",
                align: "start",
                popoverClass: 'ltu-tour ltu-end-tour',
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                }
              }
            }]
        } else {
          $scope.tourLabel = 'Tour the <strong>Databases</strong> search page';

          $scope.tourSteps = [{ 
            popover: { 
                title: 'Welcome to the databases search', 
                description: "This search allows you to find databases within the library's many collections.",
                //nextBtnText: "Let's begin!",
                showButtons: ["next", "close"],
                popoverClass: 'ltu-tour ltu-begin-tour'
            }
          }, {
            element: ".search-elements-wrapper",
            popover: {
              title: "Search field",
              description: "Enter the term that you want to search for.",
              side: "bottom",
              align: "center"
            }
          }, {
            element: ".language-characters",
            popover: {
              title: "Know what it starts with?",
              description: "Search titles starting with these characters.",
              side: "bottom",
              align: "center"
            }
          }, {
            element: isMobileView ? "button:has([translate='nui.dbcategories.mobileCategories'])" : ".databases-categories",
            popover: {
              title: "Database categories",
              description: "Browse by database category. Select the arrow next to a category to see any sub-categories.",
              side: "top",
              align: "start"
            }
          }, {
            element: ".s-lch-widget-float-btn",
            popover: {
              title: "Need help?",
              description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
              side: "bottom",
              align: "center",
              onNextClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to open the menu so we can highlight the next element
                  var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                  if(menuBtn) menuBtn.click();

                  // allow time for the menu to show
                  setTimeout(function() {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }, menuDelay); 
                } else {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }
              }
            }
          },
          // FOLLOWING ELEMENT IS EITHER IN MENU OR ON THE PAGE
          {
            element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
            popover: {
              title: "Ran into an issue?",
              description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
              side: "right",
              align: "end",
              onPrevClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to close the menu so we can highlight the previous element
                  var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                  if(closeBtn) closeBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }, menuDelay);
                } else {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }
              },
              onNextClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to close the menu so we can highlight the next element
                  var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                  if(closeBtn) closeBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }, menuDelay); 
                } else {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }
              }
            }
          },
          // FOLLOWING ELEMENT IS ON THE PAGE
          {
            element: "#logoImage",
            popover: {
              title: "Library website",
              description: "To return to the library website, select the La Trobe University logo.",
              side: "bottom",
              align: "center",
              onPrevClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to open the menu so we can highlight the next element
                  var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                  if(menuBtn) menuBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }, menuDelay);
                } else {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }
              }
            }
          }, {
            element: "#tour_button",
            popover: {
              title: "That's all for now",
              description: "Thanks for taking the tour. You can restart it at any time from here.",
              side: "bottom",
              align: "end",
              popoverClass: 'ltu-tour ltu-end-tour'
            }
          }]
        }
      } else if(/\/npsearch\?/.test(url)) {
        // newspaper article search
        
        if(/query/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Newspaper articles</strong> search results page';

          $scope.tourSteps = [
            {
              element: "prm-brief-result-container",
              popover: {
                title: "Search results",
                description: "The results of your search are listed on the page. Select an item from the results to see its details.",
                showButtons: ["next", "close"],
                side: "bottom",
                align: "center"
              }
            }, {
              element: ".result-item-actions prm-save-to-favorites-button",
              popover: {
                title: "Save to favourites",
                description: "You can save an item to your favourites to make it easier to find again.",
                side: "right",
                align: "center"
              }
            }, {
              element: isMobileView ? null : ".result-item-actions button[data-qa='open_up_front_Citation_action']",
              popover: {
                title: "View citation formats",
                description: "If you need to cite an item in your work, you can select its citation button to view its details in various standard reference formats.",
                side: "right",
                align: "center"
              }
            }, {
              element: isMobileView || isSmallView ? "button[aria-label='Refine my results']" : "prm-facet",
              popover: {
                title: "Narrow your results",
                description: "Apply filters (such as 'Date' and 'Subject') to narrow down your search.",
                side: "right",
                align: "center"
              }
            }, {
              element: "prm-alert-bar:has(prm-authentication)",
              popover: {
                title: "Sign in",
                description: "You may need to be signed in to view some articles.",
                side: "top",
                align: "center"
              }
            }, {
              element: ".search-elements-wrapper",
              popover: {
                title: "Search field",
                description: "If you didn't get the results that you were after, try searching for a different term.",
                side: "bottom",
                align: "center"
              }
            }, {
              element: ".s-lch-widget-float-btn",
              popover: {
                title: "Need help?",
                description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
                side: "bottom",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS EITHER IN MENU OR ON THE PAGE
            {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
              popover: {
                title: "Ran into an issue?",
                description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
                side: "right",
                align: "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the previous element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                },
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the next element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS ON THE PAGE
            {
              element: "#logoImage",
              popover: {
                title: "Library website",
                description: "To return to the library website, select the La Trobe University logo.",
                side: "bottom",
                align: "start",
                popoverClass: 'ltu-tour ltu-end-tour',
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                }
              }
            }]
        } else {
          $scope.tourLabel = 'Tour the <strong>Newspaper articles</strong> search page';
          
          $scope.tourSteps = [{ 
            popover: { 
                title: 'Welcome to the newspaper articles search', 
                description: "This search allows you to find newspaper articles within the library's collections.",
                showButtons: ["next", "close"],
                popoverClass: 'ltu-tour ltu-begin-tour'
            }
          }, {
            element: ".search-elements-wrapper",
            popover: {
              title: "Search field",
              description: "Enter the term that you want to search for.",
              side: "bottom",
              align: "center"
            }
          }, {
            element: "prm-newspapers-home div:has(> .newspapers-card-container)",
            popover: {
              title: "Featured newspapers",
              description: "You may limit your search to within one of the featured newspapers.",
              side: "top",
              align: "center"
            }
          }, {
            element: ".s-lch-widget-float-btn",
            popover: {
              title: "Need help?",
              description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
              side: "bottom",
              align: "center",
              onNextClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to open the menu so we can highlight the next element
                  var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                  if(menuBtn) menuBtn.click();

                  // allow time for the menu to show
                  setTimeout(function() {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }, menuDelay); 
                } else {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }
              }
            }
          },
          // FOLLOWING ELEMENT IS EITHER IN MENU OR ON THE PAGE
          {
            element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
            popover: {
              title: "Ran into an issue?",
              description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
              side: "right",
              align: "end",
              onPrevClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to close the menu so we can highlight the previous element
                  var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                  if(closeBtn) closeBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }, menuDelay);
                } else {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }
              },
              onNextClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to close the menu so we can highlight the next element
                  var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                  if(closeBtn) closeBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }, menuDelay); 
                } else {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }
              }
            }
          },
          // FOLLOWING ELEMENT IS ON THE PAGE
          {
            element: "#logoImage",
            popover: {
              title: "Library website",
              description: "To return to the library website, select the La Trobe University logo.",
              side: "bottom",
              align: "start",
              onPrevClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to open the menu so we can highlight the next element
                  var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                  if(menuBtn) menuBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }, menuDelay);
                } else {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }
              }
            }
          }, {
            element: "#tour_button",
            popover: {
              title: "That's all for now",
              description: "Thanks for taking the tour. You can restart it at any time from here.",
              side: "bottom",
              align: "end",
              popoverClass: 'ltu-tour ltu-end-tour'
            }
          }]
        }
      } else if(/\/jsearch_DISABLED\?/.test(url)) {
        // journal search
        
        var stdJSearchUrl = url.replace('/jsearch', '/search').replace('&tab=jsearch_slot','').replace('&startTour=1', '') + '&facet=rtype,include,journals';

        if(/query/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>E-journals</strong> search results page';

          $scope.tourSteps = [
            {
              element: "prm-brief-result-container",
              popover: {
                title: "Search results",
                description: "The results of your search are listed on the page. Select an item from the results to see its details.",
                showButtons: ["next", "close"],
                side: "bottom",
                align: "center"
              }
            }, {
              element: "prm-alert-bar:has(prm-authentication)",
              popover: {
                title: "Sign in",
                description: "You may need to be signed in to view some results.",
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-atoz-search-bar .layout-row[role='search'] > .layout-column",
              popover: {
                title: "Search field",
                description: "If you didn't get the results that you were after, try a new search. You can also try a <a href='"+stdJSearchUrl+"'>search using the standard library search</a>.",
                side: "bottom",
                align: "center",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }]
        } else {
          $scope.tourLabel = 'Tour the <strong>E-journals</strong> search page';

          $scope.tourSteps = [{ 
            popover: { 
                title: 'Welcome to the journal search tour', 
                description: 'Take a quick tour to view some of the main features available for a journal search.',
                //nextBtnText: "Let's begin!",
                showButtons: ["next", "close"],
                popoverClass: 'ltu-tour ltu-begin-tour'
            }
          }, {
            element: ".search-elements-wrapper",
            popover: {
              title: "Search field",
              description: "Enter the term that you want to search for.",
              side: "bottom",
              align: "center"
            }
          }, {
            element: ".language-characters",
            popover: {
              title: "Know what it starts with?",
              description: "Search titles starting with these characters.",
              side: "bottom",
              align: "center"
            }
          }, {
            element: "#logoImage",
            popover: {
              title: "Library website",
              description: "To return to the library website, select the La Trobe University logo.",
              side: "bottom",
              align: "start"
            }
          }, {
            element: "#tour_button",
            popover: {
              title: "That's all for now",
              description: "Thanks for taking the tour. You can restart it at any time from here.",
              side: "bottom",
              align: "end",
              popoverClass: 'ltu-tour ltu-end-tour'
            }
          }]
        }
      } else if(/\/browse\?/.test(url)) {
        // Browse
        
        if(/browseQuery/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Browse results</strong> page';

          $scope.tourSteps = [
            {
              element: "prm-browse-result",
              popover: {
                title: "Search results",
                description: "The results of your search are listed on the page. Select an item from the results to see the records it contains.",
                showButtons: ["next", "close"],
                side: "bottom",
                align: "center"
              }
            }, {
              element: "#speedDialWidget",
              popover: {
                title: "There's more",
                description: "Use the pagination buttons to move between pages of results.",
                side: "left",
                align: "end"
              }
            }, {
              element: ".search-elements-wrapper",
              popover: {
                title: "Search field",
                description: "If you didn't get the results that you were after, try a different search term.",
                side: "bottom",
                align: "center"
              }
            }, {
              element: ".s-lch-widget-float-btn",
              popover: {
                title: "Need help?",
                description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
                side: "bottom",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS EITHER IN MENU OR ON THE PAGE
            {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
              popover: {
                title: "Ran into an issue?",
                description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
                side: "right",
                align: "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the previous element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                },
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the next element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENT IS ON THE PAGE
            {
              element: "#logoImage",
              popover: {
                title: "Library website",
                description: "To return to the library website, select the La Trobe University logo.",
                side: "bottom",
                align: "start",
                popoverClass: 'ltu-tour ltu-end-tour',
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                }
              }
            }]
        } else {
          $scope.tourLabel = 'Tour the <strong>Browse</strong> page';

          $scope.tourSteps = [{ 
            popover: { 
                title: 'Welcome to the browse search', 
                description: "This search allows you to find a range of resources that are similar in a specific way (e.g. that have a simliar title, or have a similar call number).",
                //nextBtnText: "Let's begin!",
                showButtons: ["next", "close"],
                popoverClass: 'ltu-tour ltu-begin-tour'
            }
          }, {
            element: ".search-elements-wrapper",
            popover: {
              title: "Search form",
              description: "<p>Enter the term that you want to search for. Select the drop-down to specify which field to use for the search.</p><p>Browsing by call number will provide a list of items that would normally appear on the shelf next to the call number that you specify.</p>",
              side: "bottom",
              align: "center"
            }
          }, {
            element: ".s-lch-widget-float-btn",
            popover: {
              title: "Need help?",
              description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
              side: "bottom",
              align: "center",
              onNextClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to open the menu so we can highlight the next element
                  var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                  if(menuBtn) menuBtn.click();

                  // allow time for the menu to show
                  setTimeout(function() {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }, menuDelay); 
                } else {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }
              }
            }
          },
          // FOLLOWING ELEMENT IS EITHER IN MENU OR ON THE PAGE
          {
            element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
            popover: {
              title: "Ran into an issue?",
              description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
              side: "right",
              align: "end",
              onPrevClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to close the menu so we can highlight the previous element
                  var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                  if(closeBtn) closeBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }, menuDelay);
                } else {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }
              },
              onNextClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to close the menu so we can highlight the next element
                  var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                  if(closeBtn) closeBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }, menuDelay); 
                } else {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }
              }
            }
          },
          // FOLLOWING ELEMENT IS ON THE PAGE
          {
            element: "#logoImage",
            popover: {
              title: "Library website",
              description: "To return to the library website, select the La Trobe University logo.",
              side: "bottom",
              align: "start",
              onPrevClick: function(element, step, options) {
                if(isMobileView) {
                  // we want to open the menu so we can highlight the next element
                  var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                  if(menuBtn) menuBtn.click();

                  // allow time for the menu to hide
                  setTimeout(function() {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }, menuDelay);
                } else {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }
              }
            }
          }, {
            element: "#tour_button",
            popover: {
              title: "That's all for now",
              description: "Thanks for taking the tour. You can restart it at any time from here.",
              side: "bottom",
              align: "end",
              popoverClass: 'ltu-tour ltu-end-tour'
            }
          }]
        }
      } else if(/\/fulldisplay\?/.test(url)) {
        // item full display

        $scope.tourLabel = 'Tour the <strong>Item details</strong> page';

        var backToSearchBtn = document.querySelector(isMobileView ? "md-toolbar button[aria-label='Close Full Display']" : "md-dialog-container > div > button[aria-label='Close Full Display']");

        $scope.tourSteps = [
          {
            element: "prm-full-view-service-container prm-save-to-favorites-button button",
            popover: {
              title: "Save to favourites",
              description: "You can save this item to your favourites to make it easier to find again.",
              showButtons: ["next", "close"],
              side: "bottom",
              align: "end"
            }
          }, {
            element: "#action_list prm-full-view-service-container",
            popover: {
              title: "Export options",
              description: "These options allow you to export or share the item details.",
              side: "top",
              align: "start"
            }
          }, {
            element: "#PermalinkButtonFullView",
            popover: {
              title: "Get a link",
              description: "If you need to provide a URL to this item, select the 'Permalink' option.",
              side: "top",
              align: "end"
            }
          }, {
            element: "#CitationButtonFullView",
            popover: {
              title: "View citation formats",
              description: "If you need to cite an item in your work, you can select its citation button to view its details in various standard reference formats.",
              side: "top",
              align: "end"
            }
          }, {
            element: "#getit_link1_0 prm-full-view-service-container",
            popover: {
              title: "View the item",
              description: "This section shows the options you have to view or request the item.",
              side: "top",
              align: "start"
            }
          }, {
            element: "#details prm-full-view-service-container",
            popover: {
              title: "Item details",
              description: "Find out more details about the item, such as its publish date and identifiers.",
              side: "top",
              align: "center",
              popoverClass: 'ltu-tour'+(backToSearchBtn == null ? ' ltu-end-tour' : '')
            }
          }/*, {
            element: "#tags prm-full-view-service-container",
            popover: {
              title: "Tags",
              description: "You can add your own tags to an item, which can be used when searching by 'User tags' in the advanced search.",
              side: "top",
              align: "center",
              popoverClass: 'ltu-tour'+(backToSearchBtn == null ? ' ltu-end-tour' : '')
            }
          }*/]

          if(backToSearchBtn != null) {
            // add an extra step to show how to exit the full-view details
            $scope.tourSteps = $scope.tourSteps.concat([
              {
                element: isMobileView ? "md-toolbar button[aria-label='Close Full Display']" : "md-dialog-container > div > button[aria-label='Close Full Display']",
                popover: {
                  title: "Return to search",
                  description: "Select this button to return to your search results.",
                  side: "right",
                  align: "center",
                  popoverClass: 'ltu-tour ltu-end-tour'
                }
              }
            ])
          }

          /*
          // if the full details are displayed over the main content, move (& clone) the tour button
          if(document.querySelector("prm-full-view-page") == null && document.querySelector("prm-full-view #tour_button") == null) {
            var fullView = document.querySelector("prm-full-view");
            var tourBtn = document.querySelector("#tour_button");
            if(tourBtn) {
              var clone = tourBtn.cloneNode(true);
              //clone.addEventListener("click", $scope.startTour);
              clone.classList.add('is-clone');
              if(fullView) fullView.appendChild(clone);
            }
          }
          */
      } else if(/\/account\?/.test(url)) {
        // my account
        
        $scope.tourLabel = 'Tour the <strong>My account</strong> page';

        $scope.tourSteps = [{ 
          popover: { 
              title: "Welcome to your account", 
              description: "The 'My account' section is where you can view your current loans, pending requests for resources, pay any outstanding fines for lost items, and update your personal details.",
              showButtons: ["next", "close"],
              popoverClass: 'ltu-tour ltu-begin-tour'
          }
        }, {
          element: "prm-account-overview md-tabs-wrapper",
          popover: {
            title: "Account sections",
            description: "Use these tabs to move between the different section of your account.",
            side: "bottom",
            align: "center"
          }
        }, {
          element: "#favorites-button",
          popover: {
            title: "View your favourites",
            description: "If you have saved any items or searches to your favourites, you can view them via this button. This is available here and on any search page.",
            side: "bottom",
            align: "end",
            onNextClick: function(element, step, options) {
              // we want to open the menu so we can highlight the next element
              var menuBtn = document.querySelector(isMobileView ? 'prm-topbar button.mobile-menu-button' : 'prm-user-area-expandable button:has(span[class="user-name"])');
              if(menuBtn) menuBtn.click();

              // allow time for the menu to show
              setTimeout(function() {
                // continue to the next step
                $scope.driverObj.moveNext();
              }, menuDelay);
            }
          }
        }, 
        // FOLLOWING ELEMENT IS EITHER IN MAIN MENU OR IN THE ACCOUNT MENU
        {
          element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='eshelf.signout.title.link'])" : "#signOutButton",
          popover: {
            title: "Signing out",
            description: "If you are on a library (or shared) computer, don't forget to sign out once you have finished your work. You can find the sign out button in either the user menu or via the '3-dot' main menu.",
            side: "bottom",
            align: "end",
            onPrevClick: function(element, step, options) {
              // we want to close the menu so we can highlight the previous element
              var closeBtn = document.querySelector(isMobileView ? '#mainMenuFullCloseButton' : 'md-backdrop');
              if(closeBtn) closeBtn.click();
              
              // allow time for the menu to hide
              setTimeout(function() {
                // go back to the previous step
                $scope.driverObj.movePrevious();
              }, menuDelay);
            },
            onNextClick: function(element, step, options) {
              // we want to close the menu so we can highlight the previous element
              var closeBtn = document.querySelector(isMobileView ? '#mainMenuFullCloseButton' : 'md-backdrop');
              if(closeBtn) closeBtn.click();

              // allow time for the menu to hide
              setTimeout(function() {
                // continue to the next step
                $scope.driverObj.moveNext();
              }, menuDelay); 
            }
          }
        }, 
        // FOLLOWING ELEMENTS ARE ON THE PAGE
        {
          element: isMobileView ? "button.mobile-menu-button" : "#mainMenu",
          popover: {
            title: "Main menu",
            description: "Use this menu to start a search for any library resources or view help documentation.",
            side: "bottom",
            align: "center",
            onPrevClick: function(element, step, options) {
              // we want to open the menu so we can highlight the next element
              var menuBtn = document.querySelector(isMobileView ? 'prm-topbar button.mobile-menu-button' : 'prm-user-area-expandable button:has(span[class="user-name"])');
              if(menuBtn) menuBtn.click();

              // allow time for the menu to show
              setTimeout(function() {
                // go back to the previous step
                $scope.driverObj.movePrevious();
              }, menuDelay);
            }
          }
        }, {
          element: ".s-lch-widget-float-btn",
          popover: {
            title: "Need help?",
            description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
            side: "bottom",
            align: "center",
            onNextClick: function(element, step, options) {
              if(isMobileView) {
                // we want to open the menu so we can highlight the next element
                var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                if(menuBtn) menuBtn.click();

                // allow time for the menu to show
                setTimeout(function() {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }, menuDelay); 
              } else {
                // continue to the next step
                $scope.driverObj.moveNext();
              }
            }
          }
        },
        // FOLLOWING ELEMENTS ARE EITHER IN MENU OR ON THE PAGE
        {
          element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
          popover: {
            title: "Ran into an issue?",
            description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library.",
            side: "right",
            align: "end",
            onPrevClick: function(element, step, options) {
              if(isMobileView) {
                // we want to close the menu so we can highlight the previous element
                var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                if(closeBtn) closeBtn.click();

                // allow time for the menu to hide
                setTimeout(function() {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }, menuDelay);
              } else {
                // go back to the previous step
                $scope.driverObj.movePrevious();
              }
            },
            onNextClick: function(element, step, options) {
              if(isMobileView) {
                // we want to close the menu so we can highlight the next element
                var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                if(closeBtn) closeBtn.click();

                // allow time for the menu to hide
                setTimeout(function() {
                  // continue to the next step
                  $scope.driverObj.moveNext();
                }, menuDelay); 
              } else {
                // continue to the next step
                $scope.driverObj.moveNext();
              }
            }
          }
        },
        // FOLLOWING ELEMENTS ARE ON THE PAGE
        {
          element: "#logoImage",
          popover: {
            title: "Library website",
            description: "To return to the library website, select the La Trobe University logo.",
            side: "bottom",
            align: "start",
            onPrevClick: function(element, step, options) {
              if(isMobileView) {
                // we want to open the menu so we can highlight the next element
                var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                if(menuBtn) menuBtn.click();

                // allow time for the menu to hide
                setTimeout(function() {
                  // go back to the previous step
                  $scope.driverObj.movePrevious();
                }, menuDelay);
              } else {
                // go back to the previous step
                $scope.driverObj.movePrevious();
              }
            }
          }
        }, {
          element: "#tour_button",
          popover: {
            title: "That's all for now",
            description: "Thanks for taking the tour. You can restart it at any time from here.",
            side: "bottom",
            align: "end",
            popoverClass: 'ltu-tour ltu-end-tour'
          }
        }]
      } else if(/\/favorites\?/.test(url)) {
        // My favourites

        if(/section=queries/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Saved searches</strong> tab';

          $scope.tourSteps = [
            {
              element: "md-tab-content.md-active md-list",
              popover: {
                title: "Your saved searches",
                description: "Any searches that you have saved are listed here. Select the search term to perform that search again.",
                showButtons: ["next", "close"],
                side: "top",
                align: "start"
              }
            },
            {
              element: "button[aria-label='Set an RSS for this search']",
              popover: {
                title: "RSS feed",
                description: "An RSS feed of results is available for each saved search.",
                side: "left",
                align: "center"
              }
            },
            {
              element: "button[aria-label*='lert For this saved search']",
              popover: {
                title: "Set an alert",
                description: "You can opt to receive email alerts when there is an update to a saved search query. Select the alert button again to remove that alert.",
                side: "top",
                align: "end"
              }
            },
            {
              element: "md-tab-content.md-active button[aria-label='Remove Saved Search']",
              popover: {
                title: "Remove a saved search",
                description: "You can 'unpin' a search to remove it from your saved searches.",
                side: "top",
                align: "end",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }];
        } else if(/section=search_history/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Search history</strong> tab';

          $scope.tourSteps = [
            {
              element: "md-tab-content.md-active md-list",
              popover: {
                title: "Your previous searches",
                description: "Any searches that you have performed are listed here. Select the search term to perform that search again.",
                showButtons: ["next", "close"],
                side: "top",
                align: "center"
              }
            },
            {
              element: "md-tab-content.md-active button[aria-label='Add this search']",
              popover: {
                title: "Add to saved searches",
                description: "If you're signed in, you can add a search from your history to your saved searches.",
                side: "left",
                align: "end"
              }
            },            
            {
              element: "md-tab-content.md-active button[aria-label='Remove this search']",
              popover: {
                title: "Remove a search",
                description: "You can remove searches from your search history.",
                side: "top",
                align: "end",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }];
        } else {
          $scope.tourLabel = 'Tour the <strong>My favourites</strong> page';

          $scope.tourSteps = [
            {
              element: "md-tab-item:has([translate='nui.favorites.records.tabheader'])",
              popover: {
                title: "Your saved records",
                description: "Any item that you have added to your favourites is listed under the 'Saved records' tab.",
                showButtons: ["next", "close"],
                side: "top",
                align: "start"
              }
            },
            {
              element: "md-tab-content.md-active prm-search-result-list .search-within",
              popover: {
                title: "Search within your favourites",
                description: "If you're signed in, you can search to find an item within your favourites.",
                side: "right",
                align: "start"
              }
            },
            {
              element: "md-tab-content.md-active  md-list-item .unpin-button",
              popover: {
                title: "Remove from your favourites",
                description: "You can 'unpin' an item to remove it from your favourites.",
                side: "right",
                align: "start"
              }
            }, 
            {
              element: "md-tab-content.md-active prm-favorites-edit-labels-menu button",
              popover: {
                title: "Label your favourites",
                description: "You can add labels to your saved items to categorise them. It will make finding them again easier. (Only available when signed in.)",
                side: "top",
                align: "start"
              }
            },
            {
              element: isMobileView || isSmallView ? "button[aria-label='Tweak my saved records']" : "prm-favorites-labels .sidebar-inner-wrapper",
              popover: {
                title: "Filter by label",
                description: "Select a label to only show saved items that have that label applied. (Only available when signed in.)",
                side: "left",
                align: "start"
              }
            },
            {
              element: "md-tab-item:has([translate='nui.favorites.search.tabheader'])",
              popover: {
                title: "Your saved searches",
                description: "If you're signed in, any queries that you have saved are listed under the 'Saved searches' tab.",
                side: "top",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to scroll the tabs to prevent an issue with the panel's positioning
                    var scrollBtn = document.querySelector('prm-favorites md-next-button');
                    if(scrollBtn) scrollBtn.click();

                    // allow time for the tabs to scroll
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            {
              element: "md-tab-item:has([translate='nui.favorites.history.tabheader'])",
              popover: {
                title: "Your search history",
                description: "Your previously used search queries are listed under the 'Search history' tab.",
                side: "bottom",
                align: "center",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }
          ];
        }
      } else if(/\/collectionDiscovery\?/.test(url)) {
        // Featured collections

        if(/query/.test(url) && /collectionId/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Featured collection listing</strong> search results page';

          $scope.tourSteps = [
            {
              element: "prm-collection-search .collection-sort-cont",
              popover: {
                title: "Sorting",
                description: "Select how the search results should be sorted.",
                showButtons: ["next", "close"],
                side: "top",
                align: "start"
              }
            },
            {
              element: "prm-collection-search .search-within",
              popover: {
                title: "New search",
                description: "To do another search, clear the current search term (by selecting the 'X').",
                side: "left",
                align: "center"
              }
            }, {
              element: "prm-gallery-items-list",
              popover: {
                title: "Search results",
                description: "The results of your search are listed on the page. Select an item from the results to see its details.",
                showButtons: ["next", "close"],
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-collection-gallery .collection-discovery-expand-search button",
              popover: {
                title: "Search all featured collections",
                description: "You can select to search all featured collections if you would like to expand your search.",
                showButtons: ["next", "close"],
                side: "bottom",
                align: "center"
              }
            }, {
              element: "prm-gallery-item prm-save-to-favorites-button button",
              popover: {
                title: "Save to favourites",
                description: "You can save an item to your favourites to make it easier to find again.",
                side: "top",
                align: "center"
              }
            },
            {
              element: "prm-gallery-items-list button[translate='nui.brief.items.loadMore']",
              popover: {
                title: "View more items",
                description: "If there are more items than are currently displayed, select 'Load more items' to view more from the collection.",
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-collection-gallery-header prm-collection-navigation-breadcrumbs-item",
              popover: {
                title: "Go back",
                description: "Select this link to view all the featured collections.",
                side: "bottom",
                align: "start",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }];
        } else if(/query/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Featured collections</strong> search results page';

          $scope.tourSteps = [
            {
              element: "prm-collection-search .collection-sort-cont",
              popover: {
                title: "Sorting",
                description: "Select how the search results should be sorted.",
                showButtons: ["next", "close"],
                side: "top",
                align: "start"
              }
            },
            {
              element: "prm-collection-search .search-within",
              popover: {
                title: "New search",
                description: "To do another search, clear the current search term (by selecting the 'X').",
                side: "left",
                align: "center"
              }
            }, {
              element: "prm-gallery-items-list",
              popover: {
                title: "Search results",
                description: "The results of your search are listed on the page. Select an item from the results to see its details.",
                showButtons: ["next", "close"],
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-gallery-item prm-save-to-favorites-button button",
              popover: {
                title: "Save to favourites",
                description: "You can save an item to your favourites to make it easier to find again.",
                side: "top",
                align: "center"
              }
            },
            {
              element: "prm-gallery-items-list button[translate='nui.brief.items.loadMore']",
              popover: {
                title: "View more items",
                description: "If there are more items than are currently displayed, select 'Load more items' to view more from the collection.",
                side: "top",
                align: "center",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }];
        } else if(/collectionId/.test(url)) {
          $scope.tourLabel = 'Tour the <strong>Featured collection listing</strong> page';

          $scope.tourSteps = [
            {
              element: "prm-collection-search .collection-sort-cont",
              popover: {
                title: "Sorting",
                description: "Select how the items in this collection should be sorted.",
                showButtons: ["next", "close"],
                side: "top",
                align: "start"
              }
            },
            {
              element: "prm-collection-search .search-within",
              popover: {
                title: "Search",
                description: "Search within this collection.",
                side: "left",
                align: "center"
              }
            }, {
              element: "prm-gallery-items-list",
              popover: {
                title: "Collection items",
                description: "The items in the collection are listed on the page. Select an item to see its details.",
                showButtons: ["next", "close"],
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-gallery-item prm-save-to-favorites-button button",
              popover: {
                title: "Save to favourites",
                description: "You can save an item to your favourites to make it easier to find again.",
                side: "top",
                align: "center"
              }
            },
            {
              element: "prm-gallery-items-list button[translate='nui.brief.items.loadMore']",
              popover: {
                title: "View more items",
                description: "If there are more items than are currently displayed, select 'Load more items' to view more from the collection.",
                side: "top",
                align: "center"
              }
            }, {
              element: "prm-collection-gallery-header prm-collection-navigation-breadcrumbs-item",
              popover: {
                title: "Go back",
                description: "Select this link to view all the featured collections.",
                side: "bottom",
                align: "start",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }];
        } else {
          $scope.tourLabel = 'Tour the <strong>Featured collections</strong> page';

          $scope.tourClass = 'featured-collection';

          $scope.tourSteps = [
            {
              element: "prm-collection-search .search-within",
              popover: {
                title: "Search",
                description: "Search within all the featured collections.",
                showButtons: ["next", "close"],
                side: "top",
                align: "start"
              }
            },
            {
              element: "prm-gallery-collections-list",
              popover: {
                title: "Collections",
                description: "Select a collection to browse the items within it.",
                side: "right",
                align: "start"
              }
            }, {
              element: ".s-lch-widget-float-btn",
              popover: {
                title: "Need help?",
                description: "Use the chat feature to talk with a librarian, or use the 'Help' option in the main menu to access resources and information to help you with your library search.",
                side: "bottom",
                align: "center",
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to show
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENTS ARE EITHER IN MENU OR ON THE PAGE
            {
              element: isMobileView ? "prm-main-menu[menu-type='full'] button:has([translate='report.Title'])" : "#reportProblem",
              popover: {
                title: "Ran into an issue?",
                description: "If you have encountered a problem with a search, resource, or logging in, select 'Report a problem' to report it to the library. ",
                side: "right",
                align: "end",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the previous element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                },
                onNextClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to close the menu so we can highlight the next element
                    var closeBtn = document.querySelector('#mainMenuFullCloseButton');
                    if(closeBtn) closeBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // continue to the next step
                      $scope.driverObj.moveNext();
                    }, menuDelay); 
                  } else {
                    // continue to the next step
                    $scope.driverObj.moveNext();
                  }
                }
              }
            },
            // FOLLOWING ELEMENTS ARE ON THE PAGE
            {
              element: "#logoImage",
              popover: {
                title: "Library website",
                description: "To return to the library website, select the La Trobe University logo.",
                side: "bottom",
                align: "start",
                onPrevClick: function(element, step, options) {
                  if(isMobileView) {
                    // we want to open the menu so we can highlight the next element
                    var menuBtn = document.querySelector('prm-topbar button.mobile-menu-button');
                    if(menuBtn) menuBtn.click();

                    // allow time for the menu to hide
                    setTimeout(function() {
                      // go back to the previous step
                      $scope.driverObj.movePrevious();
                    }, menuDelay);
                  } else {
                    // go back to the previous step
                    $scope.driverObj.movePrevious();
                  }
                }
              }
            }, {
              element: "#tour_button",
              popover: {
                title: "That's all for now",
                description: "Thanks for taking the tour. You can restart it at any time from here.",
                side: "bottom",
                align: "end",
                popoverClass: 'ltu-tour ltu-end-tour'
              }
            }
          ];
        }
      } else {
        $scope.tourLabel = null;
      }

      if($scope.tourLabel != null) {
        // animate the button if the type of tour has changed
        $scope.animateButton = $rootScope.tourLabel != $scope.tourLabel;
        $rootScope.tourLabel = $scope.tourLabel;      
        //console.log('animate tour button: '+$scope.animateButton);

        if($scope.animateButton) {
          // remove the 'animate' class after the animation would have finished
          $timeout.cancel($scope.timer);
          $scope.timer = $timeout(function(e){
            $scope.animateButton = false;
          }, 550);

          // check whether the tour should be launched automatically (via a URL param)
          if(/startTour=1/.test(url)) {
            var urlParams = new URLSearchParams(url);
            var initialStep = parseInt(urlParams.get('tourStep'));
            if(isNaN(initialStep)) initialStep = 0;

            $timeout(function(e) {
              $scope.startTour(initialStep);
            }, 500);
          }
        }
      }

      if(/mode=advanced/.test(url)) {
        // add another guided tour specifically for the advanced search
        
        // remove any previous GT btn
        var prevGTBtn = document.getElementById("adv_search_tour");
        if(prevGTBtn) prevGTBtn.remove();

        // create a link/button to launch the tour
        var div = document.createElement('div');
        div.innerHTML = '<a href="" id="adv_search_tour" title="Tour the advanced search"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg></a>';
        var btn = div.firstElementChild;

        // set up the tour steps
        $scope.advSearchTourSteps = [
          {
            popover: {
              title: "Using the advanced search",
              description: "The advanced search lets you specify more search criteria to narrow down the results that are returned.",
              showButtons: ["next", "close"],
              side: "top",
              align: "center"
            }
          }, {
            element: "prm-advanced-search md-input-container:has([translate='search-advanced.scopes.label'])",
            popover: {
              title: "Set the scope",
              description: "If you want to limit your search to either physical or online resources, select that option here.",
              side: "bottom",
              align: "center"
            }
          }, {
            element: "prm-advanced-search md-select:has([translate='search-advanced.scope.option.nui.advanced.index.any']",
            popover: {
              title: "Specify a field",
              description: "To search in a specific field (e.g. title or subject), you can select it here.",
              side: "top",
              align: "center"
            }
          }, {
            element: "prm-advanced-search md-select:has([translate='search-advanced.precisionOperator.option.contains']",
            popover: {
              title: "Specify the precision",
              description: "Select whether the field should contain, match exactly, or begin with your search term.",
              side: "top",
              align: "center"
            }
          }, {
            element: "prm-advanced-search input[aria-label^='Type Search Query for complex line number']",
            popover: {
              title: "Add your search term",
              description: "Enter the search term for this line here.",
              side: "top",
              align: "center"
            }
          }, {
            element: "prm-advanced-search div:has(> button[aria-label='Add a new line'])",
            popover: {
              title: "Add another line",
              description: "You can add up to seven lines in your search query.",
              side: "top",
              align: "center"
            }
          }, {
            element: "prm-advanced-search .advanced-drop-downs",
            popover: {
              title: "Apply filters",
              description: "You can apply filters to limit the results to certain types (e.g. Articles or Databases), languages, and date of publication.",
              side: "left",
              align: "center",
            }
          }, {
            element: "prm-advanced-search button.button-confirm",
            popover: {
              title: "Perform the search",
              description: "When you have prepared all the search filters and terms, select 'Search' to view the results of your query. Note that you will be able to apply additional filters to narrow down the search results after performing the search.",
              side: "top",
              align: "center",
              popoverClass: 'ltu-tour ltu-end-tour'
            }
          }];
        
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          
          // expand the advanced search (if it's collapsed)
          var expBtn = document.querySelector("prm-advanced-search .collapsed-button[aria-expanded='false']");
          if(expBtn) expBtn.click();

          // start the tour (removing any active ones)
          if($scope.driverObj && $scope.advSearchTourSteps) {
            //console.log('GT - START ADV SEARCH TOUR');
            
            // clear any existing tour
            $scope.driverObj.destroy();
            
            // clear the record of steps taken
            $scope.stepsTaken = '';

            // set the type of tour (i.e. general or advanced search)
            $scope.tourType = 'advanced search';

            // record the time the tour started
            $scope.tourStartTime = Date.now();

            // track in GA4
            gtag("event", "guided_tour_started", {
              tour_label: "Tour the advanced search",
              tour_type: $scope.tourType,
              page_location: window.location.href
            });

            // start the tour
            $scope.driverObj.setSteps($scope.advSearchTourSteps);
            $scope.driverObj.drive();
          }
        });

        // set a timeout as the advanced tab may not be there straight away
        setTimeout(function() {
          // add the button to the tab
          var tab = document.querySelector("prm-advanced-search md-tab-item");
          //console.log('Add adv tour - '+(tab != null))
          
          if(tab) tab.appendChild(btn);
        }, 200);
      }
    }
  });
  // ------------------------------------------- end Guided tour integration
  


  /*
  // add a tour button for the full view dialog
  app.component('prmFullViewAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'GuidedTourController',
    template: 
      '<style>:not(body):has(> .driver-active-element) { overflow: inherit !important; }</style>'+
      '<a id="detail_tour_button" href="" ng-show="tourLabel" ng-click="startTour()" ng-class="{\'animate\':animateButton, \'show\':tourLabel}">'+
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" style="margin: 0 5px 0 0;font-size: 1.1em;"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M224 32H64C46.3 32 32 46.3 32 64v64c0 17.7 14.3 32 32 32H441.4c4.2 0 8.3-1.7 11.3-4.7l48-48c6.2-6.2 6.2-16.4 0-22.6l-48-48c-3-3-7.1-4.7-11.3-4.7H288c0-17.7-14.3-32-32-32s-32 14.3-32 32zM480 256c0-17.7-14.3-32-32-32H288V192H224v32H70.6c-4.2 0-8.3 1.7-11.3 4.7l-48 48c-6.2 6.2-6.2 16.4 0 22.6l48 48c3 3 7.1 4.7 11.3 4.7H448c17.7 0 32-14.3 32-32V256zM288 480V384H224v96c0 17.7 14.3 32 32 32s32-14.3 32-32z"></path></svg>'+
        '<span ng-bind-html="tourLabel"></span>'+
      '</a>'
  });
  */


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
