(function(){
	"use strict";
	angular.module("app", ["com.chresoft.validator"])
	.controller("FormController", [function FormController(){
		var vm = angular.extend(this, {
			validate : function(isValid, rule, modelValue, fieldValue){
				return isValid;
			},

			fields : [
				{
					label:"UserName",
					name:"username",
					type:"text",
					rules : [
						{name:"required", value:false},
						{name:"minlength", value:5},
						{name:"maxlength", value:20}
					]
				},
				{
					label:"Password",
					name:"password",
					type:"password",
					rules : [
						{name:"required"},
						{name:"minlength", value:3},
						{name:"numeric"}
					]
				},
				{
					label:"Email Address",
					name:"email",
					type:"email",
					rules : [
						{name : "required"},
						{name : "email" }
					]
				}
			]
		});
	}]);
})();