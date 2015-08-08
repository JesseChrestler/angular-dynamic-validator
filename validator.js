(function(){
	"use strict";
	angular.module("com.chresoft.validator", [])
	.directive("validatorRules", ["$injector", function($injector){
		window.injector = $injector;
		var validationRules = {	
			required : {
				message : "is required.",
				directive : "ngRequiredDirective"
			},
			maxlength : {
				message : "must be less than or equal to {{value}} characters.",
				directive : "ngMaxlengthDirective"
			},
			minlength : {
				message : "must be greater than or equal to {{value}} characters.",
				directive : "ngMinlengthDirective"
			},
			/*this is how we will handle custom validation rules*/
			email : {
				message : "must be a valid email format.",
				pattern : "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
			},
			numeric : {
				message : "must be numeric.",
				pattern : "^\\d+$"
			}
		}
		var addRule = function(rule, scope, element, attrs, controller){
			var validationRule = validationRules[rule.name];
			if(validationRule !== undefined){
				//this will take care of pattern matching
				var validatorFunction = function(modelValue, viewValue){
					var pattern = new RegExp(validationRule.pattern);
					if(viewValue === undefined || viewValue === ""){
						return true;
					}
					if(pattern.test(viewValue)){
						return true;
					}
					return false;
				};
				
				if(validationRule.directive !== undefined){
					//we must get the validation function
					var directives = $injector.get(validationRule.directive);
					var directive = directives[0]; //the first object in the array.
					//we also need add the value to attrs for the directive
					attrs[rule.name] = rule.value;
					//this will dynamically link the function to our input
					directive.link(scope, element, attrs, controller);
					//now we must update our validation function
					validatorFunction = controller.$validators[rule.name];
				}
				var validateFunction = controller.$validate;

				controller.$validators[rule.name] = function(modelValue, viewValue){
					var isValidRule = validatorFunction(modelValue, viewValue);
					//this is a global validation function that can be invoked on every validation rule.
					if(typeof scope.validatorFunction === "function"){
						var isValid = scope.validatorFunction(rule, modelValue, viewValue, isValidRule);
						if(isValid !== undefined){
							isValidRule = isValid;
						}
					}
					if(scope.validatorError === undefined){
						scope.validatorError = {};
					}
					if(!isValidRule){
						var msg = validationRule.message;
						if(scope.validatorErrorField !== undefined){
							 msg = scope.validatorErrorField + " " + msg;
						}
						if(msg.indexOf("{{value}}") !== -1){
							msg = msg.replace("{{value}}", rule.value);
						}
						scope.validatorError[rule.name] = msg;
					}else{
						delete scope.validatorError[rule.name];
					}
					//we can add some custom events to be fired or show a tooltip
					return isValidRule;
				};

				controller.$validate = function(){
					var isValidField = validateFunction();

					return isValidField;
				}

			}else{
				throw new Error("validation rule ["+rule.name+"] doesn't exist. please add it.")
			}
		}

		return {
			scope : {
				validatorRules: "=",
				validatorError: "=",
				validatorErrorField : "=",
				validatorFunction : "=",
				validatorMessage : "="

			},
			require : "^ngModel",
			/*controller becomes an instance of ngModel that's been invoked*/
			link : function(scope, element, attrs, controller){
				var rules = scope.validatorRules;
				//now we have the rules... let's apply them if they exist... :)
				if(rules != undefined && rules.length > 0){
					for(var i = 0; i < rules.length;i++){
						var rule = rules[i];
						addRule(rule, scope, element, attrs, controller)
					}
				}
			}
		}
	}]);
})();