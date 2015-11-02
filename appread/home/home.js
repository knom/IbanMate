(function(){
  'use strict';

  // The Office initialize function must be run each time a new page is loaded
  Office.initialize = function(reason){
    jQuery(document).ready(function(){
      app.initialize();

      displayItemDetails();
    });
  };

  // Displays the "Subject" and "From" fields, based on the current mail item
  function displayItemDetails(){
    var j=jQuery;
    
    var iban = Office.context.mailbox.item.getRegExMatches().ibanMatches;
    
    j('#iban').text(iban);
    
    var l = window.location;
    var url = l.protocol + "//" + l.host + "/foo/?iban=" + iban;
    
    j.getJSON(url).success(function(e){
      if (e.IsValid){
        j('#bank').text(e.Bank);
        j('#bic').text(e.BIC);
        j('#address1').text(e.Zip + " " + e.City);
        j('#address2').text(e.Address);
      }
      else{
        app.showNotification("Invalid IBAN!"); 
      }
    });
    
    // app.showNotification("max");
        
    j('#content-main').show();
    j('#loading').hide();
    
  }
})();
