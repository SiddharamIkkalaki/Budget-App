// BUDGET CONTROLLER
var budgetController = (function(){
   var Expense =  function(id, description, value){
       this.id = id,
       this.description = description,
       this.value = value,
       this.percentage = -1
   };

   Expense.prototype.calcPercentage = function(totalIncome){
      if(totalIncome > 0){
          this.percentage = Math.round((this.value/totalIncome) * 100);
      }else{
          return this.percentage = -1
      }
   };
   Expense.prototype.getPercentage = function(){
        return this.percentage;
 };
   var Income =  function(id, description, value){
    this.id = id,
    this.description = description,
    this.value = value
};

var calculateTotal = function(type){
   var sum = 0;
   data.allItems[type].forEach(function(cur){
      sum += cur.value
   });
   data.totals[type] = sum
};
var data = {
    allItems: {
        exp:[],
        inc:[],
    },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
};

return {
    addItem: function(type, des, val){
        var newItem, ID;

        // [1 2 3 4 5],  next id = 6
        // [1 2 4 6 8],  next id = 9
        // ID = last ID+1

        //craete new ID
        if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        }else{
            ID = 0
        }
        //create new item based on the inc or exp type 
        if(type === 'exp'){
            newItem = new Expense(ID, des, val)
        } else if(type === 'inc'){
            newItem = new Income(ID, des, val)
        }
        // push new item to our data structure
        data.allItems[type].push(newItem)
        // return the new item
        return newItem;
    },
    deleteItem: function(type, id){
        // id = 6
        // data.allItems[type][ID] : not correct way
        // [2, 4, 6, 8]
        // index = 3 

        ids = data.allItems[type].map(function(current){
            return current.id;
        });
        index = ids.indexOf(id);

        if(index !== -1){
            data.allItems[type].splice(index, 1)
        }
    },
     calculateBudget: function(){
      // 1. calcuate total income and expense
           calculateTotal('exp');
           calculateTotal('inc');           
      // 2. calculate budget: income - expense
          data.budget = data.totals.inc - data.totals.exp;
      // 3. calculate the percentage of income that we spent
          if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
          }else{
              data.percentage = -1;
          }
     },
     calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc)
            })
     },
     getPercentages: function(){
         var allPerc = data.allItems.exp.map(function(cur){
             return cur.getPercentage()
         });
         return allPerc;
     },
     getBudget: function(){
         return{
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
         }
     },
    testing: function(){
        console.log(data);
    }
};
})();


// UI CONTROLLER
var UIController = (function(){
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        percentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }
        dec = numSplit[1];
        return (type ='exp' ? '-' : '+') +' '+ int + '.'+ dec
      };
      var nodeListforEach = function(list, callback){
        for(i = 0; i<list.length; i++){
            callback(list[i], i);
        }
    };
      return {
          getInput: function(){
              return{
                  type: document.querySelector(DOMStrings.inputType).value,  // it will be inc or exp
                  description: document.querySelector(DOMStrings.inputDescription).value,
                  value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
              }
          },
          addlistItem: function(obj, type){
              // create HTML string with placeholder text
              var html, newHtml, element;
              if(type==='inc'){
                element = DOMStrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
              } else if(type==='exp'){
                element = DOMStrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
              }
              // replace placeholder text with actual data
              newHtml = html.replace('%id%', obj.id);
              newHtml = newHtml.replace('%description%', obj.description);
              newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
               // insert html into DOM
               document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
          },
          deleteListItem: function(selectorId){
           var e1 = document.getElementById(selectorId);
           e1.parentNode.removeChild(e1);
          },
          clearFields: function(){
              var fields, fieldsArr;
              fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
              fieldsArr = Array.prototype.slice.call(fields);
              fieldsArr.forEach(function(current, index, array){
                current.value = ''
              });
              fieldsArr[0].focus();
          },
          displayBudget: function(obj){
              var type;
                obj.budget > 0 ? type = 'inc' : type = 'exp'  
             document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
             document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
             document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
             if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
             }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
             }
          },
          displayPercentages: function(percentages){
           var fields = document.querySelectorAll(DOMStrings.percentagesLabel);

           nodeListforEach(fields, function(cur, index){
                    if(percentages[index] > 0){
                        cur.textContent = percentages[index] + '%';
                    }else{
                        cur.textContent = '---'; 
                    }
           });
          },
          displayMonth: function(){
          var now, year, month, months;
          months = ['January', 'February', 'March', 'April', 'May', 'June','July','August','September', 'October', 'November', 'December']
          now = new Date();
          month = now.getMonth();
          year = now.getFullYear();
          document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' '+ year
          },
          changeType: function(){
              var fields = document.querySelectorAll(
                  DOMStrings.inputType + ',' +
                  DOMStrings.inputDescription + ','+
                  DOMStrings.inputValue
              )
            nodeListforEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
          },
          getDOMStrings: function(){
              return DOMStrings;
          }
      };
})();
  

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    };

    var updateBudget = function(){
       // 1. Calculate the budget
       budgetCtrl.calculateBudget();
       // 2. Return the budget
       var budget = budgetCtrl.getBudget();
       // 3. Display the budget on the UI
       UICtrl.displayBudget(budget);
    };
    var updatePercentages = function(){
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages()
        // 2. Read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages()
        // 3. update the ui with new percentages
        UICtrl.displayPercentages(percentages);
        console.log(percentages);
    };
    var ctrlAddItem = function(){
        var input, newItem;
        // 1. Get the field input data
        var input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        // 2. Add the item to the budget ctrl
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. Add the item to the UI ctrl
        UICtrl.addlistItem(newItem, input.type)
        // 4. Clear input fields
        UICtrl.clearFields();
        // 5. calculate and update budget
        updateBudget();
        // 6. calculate and update the percentages
        updatePercentages();
        }
    };
 var ctrlDeleteItem = function(){
     var itemID, splitID, type, ID;
     itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
     if(itemID){
         // inc-1
         splitID = itemID.split('-');
         type = splitID[0];
         ID = parseInt(splitID[1]);

         // delete the item from the data structure
         budgetCtrl.deleteItem(type, ID);
         // delete the item from the ui
         UICtrl.deleteListItem(itemID)
         // update and show the new budget
         updateBudget();
         //  calculate and update the percentages
        updatePercentages();
     }
 }
    return{
        init: function(){
          console.log('Application has started');
          UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
         });
          setupEventListners();
          UICtrl.displayMonth();
        }
    }
})(budgetController, UIController);

controller.init();



	
	
	
	
	
	
	
	
	
	