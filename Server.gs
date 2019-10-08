var Route = {};
Route.path = function (route,callback){
  Route[route] = callback;
  
}

//LOAD WEB APP
function doGet(e) {

  Route.path("sheet",loadSheetMetal);
  
  
  if(Route[e.parameters.v] ){
  
      return Route[e.parameters.v]();
    
    } else{
      
      return HtmlService.createTemplateFromFile('Home').evaluate();
    }
}


function loadSheetMetal(){
    
   return HtmlService.createTemplateFromFile('sheetMetalHTML').evaluate();    

}



//GET MATERIAL COST FROM GSM COST SHEET
  var ss = SpreadsheetApp.openById('1kFtNEVhIQr3mMaFbXXP8hMTl_nhTr-7pHtprRf4zf5U');
  var sheet = ss.getSheetByName('Sheet Metal');
  var materialType = sheet.getRange(5, 1,8, 5).getValues();
  var finish = sheet.getRange(16, 1, 6, 4).getValues();
  var costFactor = sheet.getRange(30, 1, 6, 3).getValues();
  var hardwareCost = sheet.getRange(39, 1, 3, 2).getValues();
  var bendingCost = sheet.getRange(25, 1, 1, 2).getValues();  


//ESTIMATE FUNCTION triggered with click. Will estimate pricing based on the information input
function estimate(userInfo) {
//userinfo.strategy = 1 is agressive, 2 is intermediate, 3 is conservative
      
      userInfo.bendingCost = bendingCost[0][1];
      
      hardwareCost.forEach(function (element){
          if(element[0] === userInfo.complexity){
              userInfo.hardwareCost = element[1]
          }
      });
      
      costFactor.forEach(function (element){
          if(userInfo.EAU > element[0] && userInfo.EAU <= element[1]){
              userInfo.costFactor = element[2];
            }
        });
      
      materialType.forEach(function (element){
        if (element[0] === userInfo.material){
          userInfo.mtlPrice = element[userInfo.strategy];
        }
        if (element[0] === userInfo.material){
          userInfo.density = element[4];
        }
      });
      
      finish.forEach(function (element){
        if (element[0] === userInfo.finishOne){
          userInfo.finish1Price = element[userInfo.strategy];
        }
        
        if (element[0] === userInfo.finishTwo){
          userInfo.finish2Price = element[userInfo.strategy];
        }
      });
      
      userInfo.weight = function (){
          if (this.units === 'milimeters'){
        userInfo.weight = (this.length * this.thickness  * this.width * this.density * 0.001)/1000;
        }else{
          userInfo.weight = (this.length * this.thickness * this.width * this.density * 0.001 * 16387.064) /1000; 
        }
      }
      
      userInfo.weight();
      
      userInfo.MaterialCost = function (){
          userInfo.MaterialCost = this.weight * this.mtlPrice;
      }
      
      userInfo.MaterialCost();
      
      userInfo.estimation = function (){
          if (userInfo.hide){
          userInfo.totalHdwCost = this.qtyHdw * this.hardwareCost;
          userInfo.estimation = Math.round((this.MaterialCost + (this.bendingCost * this.bending) + this.totalHdwCost  )*100)/100;
          }else{
            userInfo.estimation = Math.round((this.MaterialCost + (this.bendingCost * this.bending)) * 100)/100;
          }
      }
      
      userInfo.estimation();
      
      userInfo.surfaceArea = function (){
          
          if (this.units === 'inches'){
          //Convert mm to meters
          userInfo.surfaceArea = this.length * this.width * 0.001 * 16387.064 ;
          }else{
            userInfo.surfaceArea = this.length * this.width * 0.000001 ;
          }
      }
      
      userInfo.surfaceArea();
      
      userInfo.totalFinishPrice1 = function (){
          userInfo.totalFinishPrice1 = this.surfaceArea * this.finish1Price ;
          userInfo.estimation += userInfo.totalFinishPrice1;
      }
      
      userInfo.totalFinishPrice1();
      
      if(userInfo.finish2Price !== undefined){
        userInfo.totalFinishPrice2 = function (){
          userInfo.totalFinishPrice2 = this.surfaceArea * this.finish2Price ;
          userInfo.estimation += userInfo.totalFinishPrice2
          }
        userInfo.totalFinishPrice2();  
      }
      
      
      
     return userInfo; 
     
}



// Parse JSON strings to objects and push to newArr. Create new Google sheet and set all objects in the sheet.

function toGS (arr,googleSheetURL){
    Logger.log(googleSheetURL);
    
   //OPEN GOOGLE SHEET BY URL
   var ss = SpreadsheetApp.openByUrl(googleSheetURL);
   var sheet = ss.getSheetByName('Sheet Metal');
   sheet.getRange(1, 1).setValue('Sheet Metal').setFontSize(14);
   var lastRow = sheet.getLastRow() + 1;
   var i = 2; 
   var j = 1;
   var initRange = sheet.getRange(lastRow, 1);
   var row = 3;
   
   //var ind = 1;
   /*
     // Check if the title -Sheet Metal- already exists in the sheet
   var columnA = sheet.getRange(1, 1, lastRow,1);
   var columnAValues = columnA.getValues();
     columnAValues.forEach(function (element){
       if (element[0]=== 'Sheet Metal' ){
           Logger.log(element[0]);
           Logger.log(ind);
         }
         ind++;
     });
   */
 
    
    var newArr = [];
    
    //ARRAY CONTAINING HEADER IN GOOGLE SHEETS FOR SHEET METAL ESTIMATIONS
    var index = [
    ["Part Number","Strategy","Units","Material","Length","Width","Thickness","Weight","Area","Part density","Cost of material","Finish type 1","Finish 1 cost","Finish type 2","Finish 2 cost","Number of bendindgs","Cost per bending","EAU","Hardware qty","Hardware complexity","Cost per hardware unit","Total hardware cost","Part estimatation in USD"]
    
        ];
    // OBJECT CONTAINING KEYS TO BE MATCHED AGAINST HEADER BY INDEX NUMBER     
    var indexObj = { partNumber:1,strategy:2, units:3,	material:4,	length:5, width:6, thickness:7,	weight:8, surfaceArea:9, density:10, mtlPrice:11, finishOne:12,	totalFinishPrice1:13, finishTwo:14,	totalFinishPrice2:15, bending:16, bendingCost:17, EAU:18, qtyHdw:19, complexity:20,	hardwareCost:21, totalHdwCost:22, estimation:23
    };
    
    arr.forEach(function (element){
        newArr.push(JSON.parse(element));
    });
    
 
   
   index[0].forEach(function (element){
       sheet.getRange(2,j).setValue(element)
       j++;
   });
   
   //Loop through each Object's keys and find its index vs indexObj, assign that index as the column number.
   newArr.forEach(function(obj){ 
     Object.keys(obj).forEach(function (elem){
          Object.keys(indexObj).forEach(function (indxObjKey){
              if (indxObjKey === elem){
                     var column = indexObj[indxObjKey] ;
                     sheet.getRange(row, column).setValue(obj[elem]);
                   }
              });         
         });
         
    row++;
   });
 
 
 
   // return address;
 
}


/*********************************************** START **************************************/
//Create new Google Sheet for this Project Number
function start (projNum){
  
  var projNum =  projNum + ' Should Cost Web App';
  var newSheet = SpreadsheetApp.create(projNum);
  var sheetMetalSheet = newSheet.insertSheet('Sheet Metal');
  var PlasticsSheet = newSheet.insertSheet('Plastics');
  var PCBSheet = newSheet.insertSheet('PCB');
  var Sheet1  = newSheet.getSheetByName('Sheet1');
  newSheet.deleteSheet(Sheet1);
  
  var id = newSheet.getId();
  var origin = DriveApp.getFileById(id);
  var folder = DriveApp.getFolderById('1xKkZ7H4J8S6aKEBsSYffxp6pIzHsMV0V');
  var fileCopied = origin.makeCopy(folder);
  var fileCopiedUrl = fileCopied.getUrl();
  
  DriveApp.getFileById(id).setTrashed(true);
  
    Logger.log(fileCopiedUrl);
    return fileCopiedUrl;

}//end of START











function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}











