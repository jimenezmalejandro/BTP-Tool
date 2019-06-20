








document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
});


   
document.getElementById("hdw").style.display = "none";
document.getElementById("infoMsg").style.display = "block";
document.getElementById("infoMsg").style.display = "none";

//Toggle Hardware option    
document.getElementById('hide').addEventListener("click",toggle);
       
         function toggle(){
            var show = document.getElementById('hdw');
  
        if(show.style.display === 'block'){
          show.style.display = 'none'
        }else{
          show.style.display = 'block';
          
         }
        }
        
       
//Show Information square
  document.getElementById('complexity').addEventListener("change",toggleInfoSqr);
            function toggleInfoSqr (){
            var value = document.getElementById('complexity').value;
            if(value ==='simple'){
                document.getElementById("infoMsg").innerHTML = "ⓘ   Simple to install items such as screws.";
                document.getElementById("infoMsg").style.display = "inline-block";  
               }else if  (value ==='medium'){
                    document.getElementById("infoMsg").innerHTML = "ⓘ    Medium complexity items, rivetting.";
                    document.getElementById("infoMsg").style.display = "inline-block";   
                     }else if(value ==='complex'){
                         document.getElementById("infoMsg").innerHTML = "ⓘ Complex items including soldering.";
                          document.getElementById("infoMsg").style.display = "inline-block";
                         }

            }



//Submit data to JS      
 document.getElementById('submit').addEventListener("click",estimate);
 
 //SHOW PRICING AS SUBMITTED
 const yourEstimation = document.querySelector('.yourEst');
 yourEstimation.style.display = 'none';
 
   function estimate(){
    //show master div PRICING MESSAGE
    yourEstimation.style.display = 'block';
 

     var userInfo = {};
     
     userInfo.strategy = document.getElementById("isAssy").value;
     userInfo.units = document.getElementById("units").value;
     userInfo.material = document.getElementById("material").value;
     userInfo.finish = document.getElementById("finish").value;
     userInfo.bending = document.getElementById("bending").value;
     userInfo.EAU = document.getElementById("EAU").value;
     userInfo.qtyHdw = document.getElementById("qtyHdw").value;
     userInfo.complexity = document.getElementById("complexity").value;
     userInfo.length = document.getElementById("length").value;
     userInfo.width = document.getElementById("width").value;
     userInfo.thickness = document.getElementById("thickness").value;
     userInfo.checkBoxState = document.getElementById("hide").checked;
     
     google.script.run.estimate(userInfo);
   }

 
 