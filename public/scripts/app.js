var app;

//extend jquery to work with animateCss;
$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            if (callback) {
              callback();
            }
        });
        return this;
    }
});

//*** This code is copyright 2002-2016 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
Date.prototype.customFormat = function(formatString){
  var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
  YY = ((YYYY=this.getFullYear())+"").slice(-2);
  MM = (M=this.getMonth()+1)<10?('0'+M):M;
  MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
  DD = (D=this.getDate())<10?('0'+D):D;
  DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][this.getDay()]).substring(0,3);
  th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
  formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);
  h=(hhh=this.getHours());
  if (h==0) h=24;
  if (h>12) h-=12;
  hh = h<10?('0'+h):h;
  hhhh = hhh<10?('0'+hhh):hhh;
  AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
  mm=(m=this.getMinutes())<10?('0'+m):m;
  ss=(s=this.getSeconds())<10?('0'+s):s;
  return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
};

(function () {
    'use strict';

     app = {
        //ELEMENTS
        sp1: $("#loginTab"),
        sp2: $("#appTab"),
        loader: $("#loader"),
        dialog: $(".dialog-container"),
        navbarHeader: $(".navbar__header"),

        /*
         * Used to figure out if we should show the user 
         */
        isFirstUnauthCheckDone: false,
        isFirstAuthCheckDone: false,

        //page currently shown (it's going to load signup first)
        currentPage: "signup",
        currentSenpai: $("#loginTab"),

        //user object
        user: undefined,
        //userSettings document
        docRefUserSettings: undefined,

        //database
        db: firebase.firestore(),

        //data
        data: {
            fridgeProducts: undefined
        },

        //is app loading
        isLoading: true
    };

    function requestPermission(){
        firebase.messaging().onMessage(onMessage);
        firebase.messaging().requestPermission().then(function(){
            saveToken();
        }).catch(function(err){
            console.log(err);
        });
    }

    function saveToken(){
        firebase.messaging().getToken().then(function(currToken){
            if(currToken){
                app.db.doc("user-settings/"+app.user.uid).get().then(function(doc){
                    var tokens = doc.data().notificationTokens;
                    if (tokens.indexOf(currToken) == -1){
                        tokens.push(currToken);
                        app.db.doc("user-settings/"+app.user.uid).update({
                            notificationTokens: tokens
                        }).then(function(){}).catch(function(err){console.log(err);});
                    }
                });
                //firebase.database().ref('users/'+app.user.uid+'/notificationTokens/'+currToken).set(true);
            }else{
                requestPermission();
            }
        }).catch(function(err){
            console.log(err);
        });
    }

    function onMessage(payload){
        console.log(payload);
        if(payload.notification){
            console.log(payload.notification);
            console.log(payload.notification.body);
            Materialize.toast(payload.notification.body, 3000);
        }
    }

    firebase.firestore().enablePersistence()
    .then(function() {
        // Initialize Cloud Firestore through firebase
        app.db = firebase.firestore();
    })
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }
    });

    //https://stackoverflow.com/a/39914235
    //https://stackoverflow.com/a/46100662
    //sleep - A promise awaiter. 
    //Pass an object with booleans which will be set to true in the promises "then"
    //Set ms for each time the awaiter checks if the promise was resolved
    
    function isBooleanTrue(aBoolean){
        return aBoolean;
    }
    function delay(ms) {
            return new Promise((resolve, reject) => {
                    setTimeout(resolve, ms);
            });
    }
    async function sleep(testFlagObj,ms) {
        var i = 0;
        while(true){
            await delay(ms);
            var shouldStop = Object.values(testFlagObj).every(isBooleanTrue);
            if(shouldStop){
                break;
            }
            console.log(i);
            i = i+1;
        }
    }

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

     $(document).on("click",".btn-my-fridge",function(){
        loadMyFridgePage();
        $('.button-collapse').sideNav('hide');
     });
     $(document).on("click",".btn-connect-stores",function(){
        loadStoreConnectSetupPage();
        $('.button-collapse').sideNav('hide');
     });
     $(document).on("click",".btn-setting",function(){
        loadSettingsPage();
        $('.button-collapse').sideNav('hide');
     });
     
     $(document).on("click",".btn-change-name",function(){
        loadChangeNamePage();
     });
     $(document).on("click",".btn-change-email",function(){
        loadChangeEmailPage();
     });
     $(document).on("click",".btn-change-pass",function(){
        loadChangePasswordPage();
     });

    $(".logout-btn").click(function(){
        firebase.auth().signOut().then(function() {
            location.reload();
        }).catch(function(error) {
          // An error happened.
        });
    });

    $("#loginTab .login-demo").click(function(){
        loginUser("petyozh@yahoo.com","Fr33R011");
    });

    $("#loginTab .login-register-btn").click(function(){
        //if someone clicks on login/register button but is already authenticated with the same account and the email is not verified
        //then resend verification email and show swal
        if( app.user!=undefined && !app.user.emailVerified ){
            //send verification e-mail
            app.user.sendEmailVerification().then(function() {
                //swal
                swal({
                    title: 'Successfully registered',
                    text: "Please verify your e-mail",
                    type: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'Resend confirmation e-mail',
                    confirmButtonText: 'Open yahoo! mail',
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.value) {
                        var url = "http://yahoo.com";
                        var win = window.open(url, '_blank');
                        win.focus();
                        //document.location = "http://yahoo.com"
                    }else if(result.dismiss === 'cancel'){
                        user.sendEmailVerification().then(function(){console.log("user verification e-mail sent");}).catch(function(error){});
                        swal({
                            type: 'success',
                            title: 'Your confirmation e-mail has been sent to ' + user.email,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                });
            });
        }else{
            toggleLoaderOn(true);
            if(app.currentPage == "signup"){
                signupUser();
                loginUser();
            }else{
                loginUser();
            }
        }

    });

    $("#loginTab .login-register-page-change a").click(switchLoginSignupPage);

    // Add/remove item in the Fridge
    $(document).on( "click", ".modal-btn-add-product", function() {
    	app.db.collection("fridges/"+app.user.uid+"/products").add({
		    name: $("#item_name").val(),
		    expiryDate: new Date($("#item_expiry").val()),
		    quantity: $("#item-quantity").val(),
		    units: $("#item-quantity-units").val()
		})
		.then(function(docRef) {
    	}).catch(function(error){
    	});
	});

    $(document).on( "click", ".modal-btn-edit-product", function() {
        var documentId = $(this)[0].dataset.id;
        app.db.collection("fridges/"+app.user.uid+"/products").doc(documentId).set({
            name: $("#item_name").val(),
            expiryDate: new Date($("#item_expiry").val()),
            quantity: $("#item-quantity").val(),
            units: $("#item-quantity-units").val()
        })
        .then(function(docRef) {
        }).catch(function(error){
        });
    });

    function checkingItemInTheFridge(){
        var numberOfItem = $(".fridge-collection").children("li").length;
        if (numberOfItem == 0) {
            $('.tap-target').tapTarget('open');
        }else{
            $('.tap-target').tapTarget('close');
        }
    }    

    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/
    function toggleLoaderOn(toggleOn){
        if(toggleOn == undefined){
            if(app.isLoading){
                toggleLoaderOn(false);
            }else{
                toggleLoaderOn(true);
            }
        }else{
            if(toggleOn){
                app.isLoading=true;
                app.loader.css("display","flex");
            }else{
                app.isLoading=false;
                app.loader.css("display","none");
            }
        }
    }

    function toggleDialogOn(toggleOn){
        if(toggleOn){
            app.dialog.css("display","block");
        }else{
            app.dialog.css("display","none");
        }
    }

    function clearDialog(){
        $(".dialog-container")[0].innerHTML = "";
    }

    function loadSignupPage(){
        $("#loginTab .login-register-btn").text("Sign up");
        $("#loginTab .login-register-page-change span").text("Have an account?");
        $("#loginTab .login-register-page-change a").text("Log in!");
        app.currentPage = "signup";
        app.currentSenpai = app.sp1;
    }

    function loadLoginPage(){
        $("#loginTab .login-register-btn").text("Log in");
        $("#loginTab .login-register-page-change span").html("Don't have an account?");
        $("#loginTab .login-register-page-change a").text("Sign up!");
        app.currentPage = "login";
        app.currentSenpai = app.sp1;
    }

    function switchLoginSignupPage(page){
        if(page == "login" || page == "signup"){
            if(page == "login"){
                loadLoginPage();
            }else{
                loadSignupPage();
            }
        }else{
            if (app.currentPage == "login"){
                loadSignupPage();
            }else{
                loadLoginPage();
            }   
        }
    }

    function showSenpai(number){
        if(number==1){
            app.currentSenpai = app.sp1;
            app.sp1.css("display","block");
            app.sp2.css("display","none");
        }else{
            app.currentSenpai = app.sp2;
            app.sp1.css("display","none");
            app.sp2.css("display","block");
        }
    }
    
    function loadDrawerData(){
        $("#slide-out .user-view .name").html(app.user.email.slice(0, -10));
        $("#slide-out .user-view .email").html(app.user.email);
    }

    async function loadChangeNamePage(){
        toggleLoaderOn(true);
        $.ajax({
          url: "partials/changeName.html"
        }).done(function( data ) {
            $(".main").html(data);
            toggleLoaderOn(false);
            $(".btn-go-back").on("click",function(){
                loadSettingsPage();
            });
        });
    }
    async function loadChangeEmailPage(){
        toggleLoaderOn(true);
        $.ajax({
          url: "partials/changeEmail.html"
        }).done(function( data ) {
            $(".main").html(data);
            toggleLoaderOn(false);
            $(".btn-go-back").on("click",function(){
                loadSettingsPage();
            });
        });
    }

    async function loadChangePasswordPage(){
        toggleLoaderOn(true);
        $.ajax({
          url: "partials/changePassword.html"
        }).done(function( data ) {
            $(".main").html(data);
            toggleLoaderOn(false);
            $(".btn-go-back").on("click",function(){
                loadSettingsPage();
            });
        });
    }

    async function loadSettingsPage(){
        toggleLoaderOn(true);
        $.ajax({
          url: "partials/setting.html"
        }).done(function( data ) {
            $(".main").html(data);
            toggleLoaderOn(false);
        });
    }

    //returns a promise that gets products
    async function loadMyFridgePage(){
        toggleLoaderOn(true);

        //things to await
        var objWaitable = {
            isFridgeHTMLloaded: false,
            isProductsDataLoaded: false
        }
        var ProductsData;

        //async request for HTML partial
        $.ajax({
          url: "partials/myFridge.html"
        }).done(function( data ) {
            $(".main").html(data);
            objWaitable.isFridgeHTMLloaded = true;
        });

        //async request for products data about the logged in users fridge
        app.db.collection("fridges/"+app.user.uid+"/products").get().then(function(querySnapshot) {
            ProductsData = querySnapshot;
            objWaitable.isProductsDataLoaded = true;
        });

        //wait promises for data and html content to be done
        await sleep(objWaitable,100);

        //initialize modal
        $('.modal').modal();

        //initialize datepicker in modal
		$('.datepicker').pickadate({
			selectMonths: true, // Creates a dropdown to control month
			selectYears: 15, // Creates a dropdown of 15 years to control year,
			today: 'Today',
			clear: 'Clear',
			close: 'Ok',
			closeOnSelect: false // Close upon selecting a date,
		});
        
        //initialize select input in modal
        $('select').material_select();

        $(".btn-add-product").click(function(){
            changeFridgeModal("add");
            $('#modal-add-item').modal('open');
        });

        var fridgeCollectionUL = document.querySelector('.fridge-collection');
        //var fridgeCollectionULjQuery = $(".fridge-collection");
        var observer = new MutationObserver(function(mutations) {});
        observer.observe(fridgeCollectionUL, { childList: true });

        $(document).on( "click", ".fridge-item_undo_delete", function() {
            var that = this;
            app.db.collection("fridges/"+app.user.uid+"/products").add({
                name: this.dataset.productName,
                expiryDate: new Date(this.dataset.expiryDate),
                quantity: this.dataset.quantity,
                units: this.dataset.units
            })
            .then(function(docRef) {
                // console.log($(that));
                // console.log($(that).parent());
            }).catch(function(error){
            });
            $(that).parent().remove();
        });

        function deleteElement(element){
            var ProductId = element.dataset.id;
            var productName = element.dataset.productName;

            //delete in the database cloud firestore
            app.db.collection("fridges/"+app.user.uid+"/products").doc(ProductId).delete().then(function() {
                console.log("Document successfully deleted!");
            }).catch(function(error) {
                console.error("Error removing document", error);
            });    

            var $toastContent = $('<span>Product ' + productName + ' deleted:</span>').add($('<button class="btn-flat toast-action fridge-item_undo_delete">Undo</button>'));
            $toastContent[1].dataset.productName = element.dataset.productName;
            $toastContent[1].dataset.expiryDate = element.dataset.expiryDate;
            $toastContent[1].dataset.quantity = element.dataset.quantity;
            $toastContent[1].dataset.units = element.dataset.units;

            Materialize.toast($toastContent, 4000);

            $(element).animateCss('slideOutLeft', function () {
                //delete in the fridge collection
                element.remove();
                checkingItemInTheFridge();
            });

        } /* end delete function*/

        function changeFridgeModal(modal){
            if(modal=="edit"){
                $("#modal-add-item .modal-btn-add-product").html("SAVE").addClass("modal-btn-edit-product").removeClass("modal-btn-add-product");
            }
            if(modal=="add"){
                $("#modal-add-item .modal-btn-edit-product").html("ADD").addClass("modal-btn-add-product").removeClass("modal-btn-edit-product");
            }
        }

        function openEditProductModal(element){
            changeFridgeModal("edit");
            $("#modal-add-item .modal-btn-edit-product")[0].setAttribute("data-id",element.dataset.id);
            var expirationDate = new Date(element.dataset.expiryDate);
            var expirationDate = expirationDate.customFormat("#D# #MMMM#, #YYYY#");
            $("#item_name").val(element.dataset.productName);
            $("#item-quantity").val(element.dataset.quantity);
            $("#item_expiry").val(expirationDate);
            $("#item-quantity-units").val(element.dataset.units);
            $('#modal-add-item').modal('open');
            resetElement(element);
        }
        function resetElement(element){
            element.style.left = 0;
        }

        function addInteractionToProductsInFridge(mutationRecords){
            mutationRecords.forEach(function(mutationRecord){
                //for (var i = 0; i < mutation.addedNodes.length; i++) {
                //    console.log('"' + mutation.addedNodes[i].textContent + '" added');
                //}
                var domObject = mutationRecord.addedNodes[0];

                var hammertime = new Hammer(domObject, {preventDefault: true});
                hammertime.on("dragup dragdown swipeup swipedown", function(ev){});
                
                //do stuff on swipe/drag left/right
                var newHammer = new Hammer (domObject);
                newHammer.on("panstart panend panleft panright", function(ev2){
                    if (ev2.type == "panend"){
                        if(ev2.deltaX < -120){
                            deleteElement(domObject);
                        }else if(ev2.deltaX > 120){
                            openEditProductModal(domObject);
                        }else{
                            resetElement(domObject);
                        }
                    }else{
                        if(ev2.center.x == 0 && ev2.center.y ==0){
                        }else{
                            var fridgeItem = $(".main").find(ev2.target).closest('.removableFridgeItem');
                            fridgeItem.css("left",ev2.deltaX+"px");
                        }   
                    }
                });
            });
        }

        var productTemplate = document.querySelector('#templateRemovableFridgeItem');    
        var productItem = productTemplate.content.querySelector(".removableFridgeItem");
        var productName = productTemplate.content.querySelector(".fridge-item-name");
        var productQuantity = productTemplate.content.querySelector(".fridge-item-quantity");
        var productTime = productTemplate.content.querySelector(".fridge-item-time-left");

        var documentsUpNotConfirmedByServer = [];
        var documentsCachedNotConfirmedByServer = [];

        app.db.collection("fridges/"+app.user.uid+"/products");

        app.db.collection("fridges/"+app.user.uid+"/products")
        .onSnapshot({ includeQueryMetadataChanges: true }, function(snapshot) {
            console.log("snapshot");
            console.log(snapshot);
            console.log("hasPendingWrites: "+snapshot.metadata.hasPendingWrites);
            console.log("fromCache: "+snapshot.metadata.fromCache);
            if(snapshot.metadata.fromCache){
                //add cached values to page
                snapshot.docChanges.forEach(function(change) {
                    documentsCachedNotConfirmedByServer.push(change.doc.id);
                    if (change.type === "added") {
                        var daysLeftToExpiry = Math.ceil((change.doc.data().expiryDate - new Date()) / (1000 * 3600 * 24));
                        var expiryString;
                        if (daysLeftToExpiry<0){
                            expiryString = "expired"
                        }else{
                            expiryString = daysLeftToExpiry + " days";
                        }
                        var productId = change.doc.id;

                        productItem.id = productId;
                        productItem.classList.add("notConfirmed");
                        productItem.setAttribute('data-id',productId);
                        productItem.setAttribute('data-expiry-date',change.doc.data().expiryDate);
                        productItem.setAttribute('data-product-name',change.doc.data().name);
                        productItem.setAttribute('data-quantity',change.doc.data().quantity);
                        productItem.setAttribute('data-units',change.doc.data().units);
                        productName.textContent = change.doc.data().name;
                        productTime.textContent = expiryString;
                        productQuantity.textContent = change.doc.data().quantity + change.doc.data().units;

                        var productTemplateClone = document.importNode(productTemplate.content, true);
                        fridgeCollectionUL.appendChild(productTemplateClone);
                        productItem.classList.remove("notConfirmed");
                        addInteractionToProductsInFridge(observer.takeRecords());
                    }
                });
            }else{
                if(snapshot.metadata.hasPendingWrites){
                    snapshot.docChanges.forEach(function(change) {
                        documentsUpNotConfirmedByServer.push(change.doc.id);
                        if (change.type === "added") {
                            var daysLeftToExpiry = Math.ceil((change.doc.data().expiryDate - new Date()) / (1000 * 3600 * 24));
                            var expiryString;
                            if (daysLeftToExpiry<0){
                                expiryString = "expired"
                            }else{
                                expiryString = daysLeftToExpiry + " days";
                            }
                            var productId = change.doc.id;

                            productItem.id = productId;
                            productItem.classList.add("notConfirmed");
                            productItem.setAttribute('data-id',productId);
                            productItem.setAttribute('data-expiry-date',change.doc.data().expiryDate);
                            productItem.setAttribute('data-product-name',change.doc.data().name);
                            productItem.setAttribute('data-quantity',change.doc.data().quantity);
                            productItem.setAttribute('data-units',change.doc.data().units);
                            productName.textContent = change.doc.data().name;
                            productTime.textContent = expiryString;
                            productQuantity.textContent = change.doc.data().quantity + change.doc.data().units;

                            var productTemplateClone = document.importNode(productTemplate.content, true);
                            fridgeCollectionUL.appendChild(productTemplateClone);
                            productItem.classList.remove("notConfirmed");
                            addInteractionToProductsInFridge(observer.takeRecords());
                        }else if(change.type === "modified"){
                            var daysLeftToExpiry = Math.ceil((change.doc.data().expiryDate - new Date()) / (1000 * 3600 * 24));
                            var expiryString;
                            if (daysLeftToExpiry<0){
                                expiryString = "expired"
                            }else{
                                expiryString = daysLeftToExpiry + " days";
                            }
                            var productId = change.doc.id;
                            var theProductName = change.doc.data().name;
                            var quantityString = change.doc.data().quantity + change.doc.data().units;

                            //change dom with data
                            $("#"+productId + " .row-fridge-collection .fridge-item-name").html(theProductName);
                            $("#"+productId + " .row-fridge-collection .fridge-item-quantity").html(quantityString);
                            $("#"+productId + " .row-fridge-collection .fridge-item-time-left").html(expiryString);
                            var changedProductItem = $("#"+productId)[0];
                            changedProductItem.setAttribute('data-expiry-date',change.doc.data().expiryDate);
                            changedProductItem.setAttribute('data-product-name',change.doc.data().name);
                            changedProductItem.setAttribute('data-quantity',change.doc.data().quantity);
                            changedProductItem.setAttribute('data-units',change.doc.data().units);
                            changedProductItem.classList.add("notConfirmed");
                            //unconfirm change on server //add class
                            //add to waiting elements
                        }
                    });
                }else{
                    snapshot.docs.forEach(function(document){
                        if(documentsCachedNotConfirmedByServer.indexOf(document.id) != -1 || documentsUpNotConfirmedByServer.indexOf(document.id) != -1){
                            $("#"+document.id).removeClass("notConfirmed");
                            var index1 = documentsCachedNotConfirmedByServer.indexOf(document.id);
                            var index2 = documentsUpNotConfirmedByServer.indexOf(document.id);
                            if(index1 != -1){
                                documentsCachedNotConfirmedByServer.splice(index1, 1);
                            }
                            if(index2 != -1){
                                documentsUpNotConfirmedByServer.splice(index2, 1);
                            }
                        }
                    });
                    snapshot.docChanges.forEach(function(change) {
                        if (change.type === "added") {
                            var daysLeftToExpiry = Math.ceil((change.doc.data().expiryDate - new Date()) / (1000 * 3600 * 24));
                            var expiryString;
                            if (daysLeftToExpiry<0){
                                expiryString = "expired"
                            }else{
                                expiryString = daysLeftToExpiry + " days";
                            }
                            var productId = change.doc.id;

                            productItem.id = productId;
                            productItem.setAttribute('data-id',productId);
                            productItem.setAttribute('data-expiry-date',change.doc.data().expiryDate);
                            productItem.setAttribute('data-product-name',change.doc.data().name);
                            productItem.setAttribute('data-quantity',change.doc.data().quantity);
                            productItem.setAttribute('data-units',change.doc.data().units);
                            productName.textContent = change.doc.data().name;
                            productTime.textContent = expiryString;
                            productQuantity.textContent = change.doc.data().quantity + change.doc.data().units;

                            var productTemplateClone = document.importNode(productTemplate.content, true);
                            
                            fridgeCollectionUL.appendChild(productTemplateClone);

                            $("#"+change.doc.id).animateCss('slideInUp', function () {
                            });

                            addInteractionToProductsInFridge(observer.takeRecords());
                        }else if(change.type === "removed"){
                            $("#"+change.doc.id).animateCss('slideOutLeft', function () {
                                //delete in the fridge collection
                                $("#"+change.doc.id).remove();
                            });
                        }
                    });
                }
            }
            checkingItemInTheFridge();
        });
        toggleLoaderOn(false);
    }

    async function loadIntroductionSetupPage(){
        $(".navbar__header").html("Guide");
        toggleLoaderOn(true);

        $(document).on("click",".introduction-page-skip",function(){
            loadStoreConnectSetupPage();
        });
        $(document).on("click",".introduction-page-next-slide",function(){
            if($("#frame").hasClass("done")){
                loadStoreConnectSetupPage();
            }
        });

        //async request for HTML partial
        $.ajax({
          url: "partials/introAddItem.html"
        }).done(function( data ) {
            $(".main").html(data);
            toggleLoaderOn(false);
        });
    }

    async function loadStoreConnectSetupPage(){
        $(".navbar__header").html("Store Accounts");
        toggleLoaderOn(true);

        $(document).on( "click", ".store-accounts-next-step", function() {
            app.db.collection("user-settings").doc(app.user.uid).update({
                isSetupFinished: true
            })
            .then(function() {
                loadMyFridgePage();
                $(".navbar__header").html("My Fridge");     
            })
            .catch(function(error){
            });
        });

        $(document).on( "click", ".disconnectStoreBtn", function() {
            $(this)[0].classList.toggle("disconnectStoreBtn",false);
            $(this)[0].classList.toggle("connectStoreBtn",true);
            $(this).find("span")[0].innerHTML = "Connect";

            var storeId = $(this).closest("ul")[0].dataset.storeId;

            app.db.doc("user-settings/"+app.user.uid+"/connected-stores/"+storeId).delete()
            .then(function(){})
            .catch(function(error){});
        });

        $(document).on( "click", ".connectStoreBtn", function() {
            $(this)[0].classList.toggle("disconnectStoreBtn",true);
            $(this)[0].classList.toggle("connectStoreBtn",false);
            $(this).find("span")[0].innerHTML = "Disconnect";

            var storeId = $(this).closest("ul")[0].dataset.storeId;
            
            app.db.doc("user-settings/"+app.user.uid+"/connected-stores/"+storeId).set({})
            .then(function(){})
            .catch(function(error){});
        });

        //things to await
        var objWaitable = {
            isStoreAccountsHTMLloaded: false,
            isStoresDataLoaded: false,
            isStoresConnectedWithDataLoaded: false
        }

        var StoresData;
        var StoresConnectedWithData;

        console.log("ask for stores");
        //async request for stores data
        app.db.collection("stores").get().then(function(querySnapshot) {
            StoresData = querySnapshot;
            objWaitable.isStoresDataLoaded = true;
            console.log("got stores");
        });

        console.log("ask for users store connections");
        //async request for stores the logged in users has connected with
        app.db.collection("user-settings/"+app.user.uid+"/connected-stores").get().then(function(querySnapshot) {
            StoresConnectedWithData = querySnapshot;
            objWaitable.isStoresConnectedWithDataLoaded = true;
            console.log("got users store connections");
        });

        console.log("ask for partial");
        //async request for HTML partial
        $.ajax({
          url: "partials/storeaccounts.html"
        }).done(function( data ) {
            $(".main").html(data);
            objWaitable.isStoreAccountsHTMLloaded = true;
            console.log("got partial");
        });

        //wait promises for data and html content to be done
        await sleep(objWaitable,100);

        var storesCollectionUL = document.querySelector('.collection-stores');
        //var fridgeCollectionULjQuery = $(".fridge-collection");

        //Load all stores
        if(StoresData.size == 0){
            //There are no stores to load
        }else{
            //Load stores
            var storeTemplate = document.querySelector('#templateStoreConnectionItem');

            var storeItem = storeTemplate.content.querySelector(".collection-store");
            var storeImage = storeTemplate.content.querySelector(".store-img");
            var storeName = storeTemplate.content.querySelector(".storeNameText");
            var connectBtn = storeTemplate.content.querySelector(".storeConnectionBtn");
            var connectBtnText = connectBtn.querySelector("span");

            StoresData.forEach(function(storeDoc) {
                storeItem.dataset.storeId = storeDoc.id;
                storeImage.src = storeDoc.data().image;
                storeName.innerHTML = storeDoc.data().name;
                var isUserConnected = false;

                if(StoresConnectedWithData.size!=0){
                    StoresConnectedWithData.forEach(function(connectedStoreDoc){
                        if(connectedStoreDoc.id == storeDoc.id){
                            isUserConnected = true;
                        }
                    });
                }
                //set a class on the button in the template
                if(isUserConnected){
                    connectBtnText.textContent = "Disconnect";
                    if(connectBtn.classList.contains("connectStoreBtn")){
                        connectBtn.classList.remove("connectStoreBtn");
                    }
                    if(!connectBtn.classList.contains("disconnectStoreBtn")){
                        connectBtn.classList.add("disconnectStoreBtn");
                    }
                }else{
                    connectBtnText.textContent = "Connect";
                    if(connectBtn.classList.contains("disconnectStoreBtn")){
                        connectBtn.classList.remove("disconnectStoreBtn");
                    }
                    if(!connectBtn.classList.contains("connectStoreBtn")){
                        connectBtn.classList.add("connectStoreBtn");
                    }
                }

                var storeTemplateClone = document.importNode(storeTemplate.content, true);
                storesCollectionUL.appendChild(storeTemplateClone);
            });
        }

        toggleLoaderOn(false);
    }

    async function loadFridgeSetupPage(){
        toggleLoaderOn(true);

        $.ajax({
          url: "partials/addFridge.html",
          async: false
        }).done(function( data ) {
            $(".main").html(data);
        });

        $(document).on( "click", ".add-fridge-next-step", function() {
            toggleLoaderOn(true);

            app.db.collection("fridges").doc(app.user.uid).update({
                name: $("#fridge_name").val()
            })
            .then(function(){
            })
            .catch(function(error){
            });
        });

        toggleLoaderOn(false);
    }

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

     
    /*****************************************************************************
     *
     * Methods and event listeners for validating input data
     *
     ****************************************************************************/
    
    //should be bigger than 0
    $(document).on( "change", ".product-quantity-validate-input", function(){

    });

    //should have atleast 3 characters
    //shouldn't be longer than 40 characters
    $(document).on( "change", ".product-name-validate-input", function(){
        
    });

    $(document).on("blur", "#password", function(){
        if($("#password").val().length < 6){
            $("#password").removeClass("valid invalid").addClass("invalid");
        }else{
            $("#password").removeClass("valid invalid").addClass("valid");
        }
    });


    /*****************************************************************************
     *
     * Methods for User Authentication
     *
     ****************************************************************************/

     function signupUser(){
        console.log("create user");
        firebase.auth().createUserWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
            console.log(errorCode);
            console.log(errorMessage);

            Materialize.toast(errorMessage, 4000);
            toggleLoaderOn(false);
        });
     }

    // After a user was created with Auth.module, create settings and fridge for the user in the firestore database
     function setUpAccountData(){
        app.db.collection("user-settings").doc(app.user.uid).set({
            isSetupFinished: false
        })
        .then(function() {
            app.db.collection("fridges").doc(app.user.uid).set({

            })
            .then(function(){
                /*app.db.collection("fridges/"+app.user.uid+"/products").add({

                })
                .then(function(docRef) {
                    console.log("User products created!: ", docRef.id);
                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });*/
            })
            .catch(function(error){
                console.error("Error writing document: ", error);
            });
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
     }

     function loginUser(email, password){
        if(email == undefined){
            email = $("#email").val();
        }

        if(password == undefined){
            password = $("#password").val();
        }

        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
        });
     }


    /************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this codelab, we've used localStorage.
     *   localStorage is a synchronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     ************************************************************************/

    firebase.auth().onAuthStateChanged(async function(user) {
        app.user = user;
        if(user!=undefined && user.uid != "c0lY7XoIgVMLGgxn06CbVlPrr5U2"){
            if (user!=undefined && user.emailVerified) {
                requestPermission();
                //show appTab
                showSenpai(2);
                
                app.docRefUserSettings = app.db.collection("user-settings").doc(user.uid);
                
                //get the user-settings document
                app.docRefUserSettings.get().then(function(doc) {
                    loadDrawerData();

                    if (doc.exists) {
                        //check if user finished settup
                        //true
                        if(doc.data().isSetupFinished) {
                            //load fridge page in appTab
                            loadMyFridgePage();
                        //false
                        }else{
                            // load setup page in appTab
                            loadIntroductionSetupPage();
                        }
                    } else {
                        //something went wrong. Why doesn't the user have a settings document?
                    }
                }).catch(function(error) {

                });
            } else if(user && !user.emailVerified) {
                requestPermission();
                setUpAccountData();

                //send verification e-mail
                user.sendEmailVerification({url:"https://pwfridge-89b1d.firebaseapp.com/"}).then(function() {
                    //swal
                    swal({
                        title: 'Successfully registered',
                        text: "Please verify your e-mail",
                        type: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        cancelButtonText: 'Resend confirmation e-mail',
                        confirmButtonText: 'Open yahoo! mail',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.value) {
                            document.location = "http://yahoo.com"
                        }else if(result.dismiss === 'cancel'){
                            user.sendEmailVerification({url:"https://pwfridge-89b1d.firebaseapp.com/"}).then(function(){console.log("user verification e-mail sent");}).catch(function(error){});
                            swal({
                                type: 'success',
                                title: 'Your confirmation e-mail has been sent to ' + user.email,
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    });
                }).catch(function(error) {
                    //user.sendEmailVerification function
                    // An error happened.
                });

                

                //show a verification screen and continue

                /*user.sendEmailVerification().then(function() {
                  // Email sent.
                }).catch(function(error) {
                  // An error happened.
                });*/
                toggleLoaderOn(false);
            }else{
                if(app.isFirstUnauthCheckDone){
                    //User is signed out
                    
                }else{
                    //load signup page
                    //executes when app runs for the first time if user is not auth.
                    app.isFirstUnauthCheckDone = true;
                }
                toggleLoaderOn(false);
            }
        }else if(user!=undefined){

            var products = ["apples","bannana","tomatoes","Milk","Potato salad","Frozen chicken wings","Ham sandwich","Chicken minched meat", "Salted beef steak", "Pancakes", "Green beans", "Shrimp","Bread"];
            var quantities = ["1","3","2","250","500","750","4","5","6","7"];
            var units = ["ml","dl","l","mg","g","kg"];
            var getRandomDate = function randomDate(start, end) {return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));}
            var getRandomNumber = function getRandomInt(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}
            var randomNumber = getRandomNumber(1,6);

            var href = new URL(window.location.href);
            var addToUser = href.searchParams.get("uid");

            var objWaitable = {};
            for(var i=0;i<randomNumber;i++){
                var myKey = "key"+i;
                objWaitable[myKey] = false;
            }

            for (var i = 0; i < randomNumber; i++){
                var myKey = "key"+i;
                var startD = new Date(((new Date()).getTime()-3*(1000*3600*24)));
                var endD = new Date((new Date()).getTime()+(8*(1000*3600*24)));
                var randomDate = getRandomDate(startD, endD);

                var nProduct = Math.floor(Math.random()*products.length);
                var nQuantity = Math.floor(Math.random()*quantities.length);
                var nUnit = Math.floor(Math.random()*units.length);

                while(nProduct==products.length){
                    var nProduct = Math.floor(Math.random()*products.length);
                }
                while(nQuantity==quantities.length){
                    var nQuantity = Math.floor(Math.random()*quantities.length);
                }
                while(nUnit==units.length){
                    var nUnit = Math.floor(Math.random()*units.length);
                }

                app.db.collection("fridges/"+addToUser+"/products").add({
                    name: products[nProduct],
                    expiryDate: randomDate,
                    quantity: quantities[nQuantity],
                    units: units[nUnit]
                })
                .then(function(docRef) {
                    console.log(objWaitable)
                    var oneSetToTrue = false;
                    /*for (var property in object) {
                        if(oneSetToTrue){
                            break;
                        }else{
                            if (object.hasOwnProperty(property)) {
                                if(object)
                            }
                        }
                    }*/
                    Object.keys(objWaitable).forEach(function(key,index) {
                        if(oneSetToTrue){
                            throw BreakException;
                        }else{
                            if(objWaitable[key]){

                            }else{
                                objWaitable[key] = true;
                                oneSetToTrue = true;
                            }
                        }
                        // key: the name of the object key
                        // index: the ordinal position of the key within the object 
                    });
                    console.log(docRef);
                }).catch(function(error){
                    console.log(error);
                });
            }

            await sleep(objWaitable, 100);

            console.log("signing out");
            firebase.auth().signOut().then(function() {
                location.reload();
            }).catch(function(error) {
              // An error happened.
            });

        }else{
            if(app.isFirstUnauthCheckDone){
                //User is signed out
                
            }else{
                //load signup page
                //executes when app runs for the first time if user is not auth.
                app.isFirstUnauthCheckDone = true;
            }
            toggleLoaderOn(false);
        }
    });

    switchLoginSignupPage("signup");

    //Materialize - setup side drawer navigation
    $(".button-collapse").sideNav();

    if($("#password").val().length){
        $("#password").parent().children()[1].classList.add("active");
    }

})();

// Register our service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js');
    });
}
