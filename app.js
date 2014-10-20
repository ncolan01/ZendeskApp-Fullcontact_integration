(function() {

var myData;

  return {

    
    defaultState: 'loadingPage', 


    events: {

      'app.activated':'userLookupByEmail'

    },

    requests: {
           

            accessFullcontactInfo: function(ticket_requester_email) {
                return {
                    url: 'https://api.fullcontact.com/v2/person.json?email=' + ticket_requester_email + '&apiKey=69b4c2bc2949cd1d',
                    type:'GET',
                    dataType: 'json'

                };
            },

             accessIdentities: function(ticket_requester_id, subdomain) {
                return {

                  url: "https://" + subdomain + ".zendesk.com/api/v2/users/" + ticket_requester_id + "/identities.json", 
                  type: 'GET', 
                  dataType: 'json'

                }; 
            },

            
            getRequesterDetails: function(ticket_requester_id, subdomain){
                return {

                  url: "https://"+ subdomain +".zendesk.com/api/v2/users/" + ticket_requester_id + ".json",
                  type: 'GET', 
                  dataType: 'json'
                 
                  };

                },

             get_fullcontact_via_twitter: function(zendesk_user_twitter_id){
                return {

                  url: "https://api.fullcontact.com/v2/person.json?twitter=" + zendesk_user_twitter_id + "&apiKey=6e8558a86d355fba",
                  type: 'GET', 
                  dataType: 'json'
                 
                  };

                },


                get_fullcontact_via_phone: function(ticket_requester_phone){
                  
                  return {

                  url: "https://api.fullcontact.com/v2/person.json?phone=" + ticket_requester_phone + "&apiKey=6e8558a86d355fba", 
                  type: 'GET', 
                  dataType: 'json'

                };

              }, 

              get_fullcontact_via_facebook: function(zendesk_user_facebook_id){                  
                  return {

                  url: "https://api.fullcontact.com/v2/person.json?facebookId=" + zendesk_user_facebook_id + "&apiKey=6e8558a86d355fba",
                  type: 'GET', 
                  dataType: 'json'

                };

              }, 

          }, 
  
              userLookupByEmail: function() {
              var ticket_requester_email = this.ticket().requester().email();  

                if (ticket_requester_email !== null ) {

                  var fullContact_api_request = this.ajax('accessFullcontactInfo', ticket_requester_email);
                  fullContact_api_request.done(this.showMainPage);
                  fullContact_api_request.fail(this.userLookupByPhone);

                  }          
    
                else {

                  this.userLookupByPhone();

                }
              
              }, 
      
              userLookupByPhone: function() {
                var ticket_requester_id = this.ticket().requester().id();  //get ticketId from app API
                var currentAccount = this.currentAccount();
                var subdomain =  currentAccount.subdomain();

                var zendesk_api_request_phone = this.ajax('getRequesterDetails',ticket_requester_id, subdomain);

                zendesk_api_request_phone.done(function(data){ //request ticket details  

                if (data.user.phone !== null) {

                 var ticket_requester_phone = data.user.phone; 


                  var search_fullcontact_via_phone = this.ajax('get_fullcontact_via_phone', ticket_requester_phone); 

                  search_fullcontact_via_phone.done(this.showMainPage); 
                  search_fullcontact_via_phone.fail(this.userLookupByIdentities); 

          
                }

                  else {

                    this.userLookupByIdentities();
                 }
              
                }); 

            },  


            userLookupByIdentities: function(){
                var ticket_requester_id = this.ticket().requester().id(); 
                  var currentAccount = this.currentAccount();
                  var subdomain =  currentAccount.subdomain();

                  console.info(subdomain); 

              
                  var zendesk_api_request = this.ajax('accessIdentities', ticket_requester_id, subdomain); 
                  zendesk_api_request.done(this.userLookupByTwitter); 



            }, 

            userLookupByTwitter: function(data){

               myData  = data.identities.toArray();

               for (var i = 0; i < myData.length; i++){

                if ( myData[i].type === "twitter" ) {

                  var zendesk_user_twitter_id = myData[i].value; 

                  //console.info(myData[i]); 

                  var search_fullcontact_via_twitter = this.ajax('get_fullcontact_via_twitter', zendesk_user_twitter_id);

                  search_fullcontact_via_twitter.done(this.showMainPage); 
                  search_fullcontact_via_twitter.fail(this.userLookupByFacebook);


                }

                else {

                this.userLookupByFacebook();  
            

                }


            }

             

          }, 

          
          userLookupByFacebook: function() {  
            

            for (var i = 0; i < myData.length; i++) {


                if (myData[i].type === 'facebook') {

                 var zendesk_user_facebook_id = myData[i].value; 

                  var search_fullcontact_via_facebook_id = this.ajax('get_fullcontact_via_facebook', zendesk_user_facebook_id); 

                  search_fullcontact_via_facebook_id.done(this.showMainPage); 
                  search_fullcontact_via_facebook_id.fail(this.showError); 


                }

                 else {

                    this.showError(); 


                   }


            }

          }, 

   showMainPage: function(data)  {
      var facebookLink; 
      var twitterLink; 
      var linkedinLink;  
      var foursquareLink; 
     
     
     

        var socialProfiles = data.socialProfiles.toArray();

            for ( var i = 0; i < socialProfiles.length; i++ ) {

                if (socialProfiles[i].typeId === "facebook"){

                facebookLink = socialProfiles[i].url;


              }
        
             else if (socialProfiles[i].typeId === "twitter"){

              twitterLink = socialProfiles[i].url;

            }

            else if (socialProfiles[i].typeId === "linkedin") {

              linkedinLink = socialProfiles[i].url;


            }

            else if (socialProfiles[i].typeId === "foursquare") {

              foursquareLink = socialProfiles[i].url; 
           }
         }




        if (typeof data.organizations === "undefined" ){

               this.switchTo('socialMediaContactPage', {

                    fullname: data.contactInfo.fullName, 
                    facebookLink: facebookLink, 
                    twitterLink: twitterLink,
                    linkedinLink: linkedinLink,
                    foursquareLink: foursquareLink,



                 }); 
             }

        else {

          console.info(data);
          var myData = data.organizations.toArray();
        

            this.switchTo('socialMediaContactPage', { 

                    fullname:       data.contactInfo.fullName,  
                    photoUrl: data.photos[0].url, 
                    facebookLink:   facebookLink, 
                    twitterLink:    twitterLink,
                    linkedinLink:    linkedinLink,
                    foursquareLink: foursquareLink,
                    organization:     myData[0].name, 
                    orgTitle:         myData[0].title, 




                }); 

            }
            }, 
          

 showError: function() {

            this.switchTo('errorPage');

  }

  };

}());