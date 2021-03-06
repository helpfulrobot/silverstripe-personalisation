(function($) {
	$.entwine('ss', function($){
		$('#DefaultOption').entwine({
			onmatch: function() {
				if(this.is(':checked')) {
					this.disableAll();
				}
			},
			onclick: function() {
				if(this.is(':checked')) {
					this.disableAll();
				} else {
					this.enableAll();
				}
				$('.add-rule').updateState();
				$('.remove-rule').updateState();
			},
			disableAll: function() {
				this.parents('.middleColumn').find('input').each(function() {
					if($(this).hasClass('checkbox') === false) $(this).attr('disabled', 'disabled');
				});
				this.parents('.middleColumn').find('select').each(function() {
					$(this).attr('disabled', 'disabled');
				});
			},
			enableAll: function() {
				this.parents('.middleColumn').find('input').each(function() {
					if($(this).hasClass('checkbox') === false) $(this).removeAttr('disabled');
				});
				this.parents('.middleColumn').find('select').each(function() {
					$(this).removeAttr('disabled');
				});
			}
		});

		$('.remove-rule').entwine({
			onclick: function() {
				var self = this;
					rules = this.parents('.rule-lines').find('.rule-line');

				
				this.parents('p').fadeOut('slow', function() { 
					if(rules.length > 1) {
						$(this).remove(); 
					}
					else {
						$(this).hide();
						$(this).parent().find('select, input').val('');
					}

					self.rearrangeRules(); 
					$('.add-rule').updateState(); 
				});

				return false;
			},
			rearrangeRules: function() {
				var i = 1;
				$('.rule-line').each( function() {
					$(this).find('input').each( function() {
						var newNameID = $(this).attr('id');
						newNameID = newNameID.split("_");
						$(this).attr('id', newNameID[0] + "_" + i);
						$(this).attr('name', newNameID[0] + "_" + i);
					});
					$(this).find('select').each( function() {
						var newNameID = $(this).attr('id');
						newNameID = newNameID.split("_");
						$(this).attr('id', newNameID[0] + "_" + i);
						$(this).attr('name', newNameID[0] + "_" + i);
					});

					i++;
				});
			},

			onmatch: function() {
				this.updateState();
			},

			updateState: function() {
				if($('#DefaultOption').is(':checked')) {
					this.hide();
					return;
				} 
				this.show();
			}
		});

		$('.add-rule').entwine({
			onclick: function() {
				if($('.rule-line').length == 1 && $('.rule-line').is(':hidden')) {
					$('.rule-line').show();
				}
				else {
					$('.rule-line:last').clone().appendTo('#EditEncodedCondition .rule-lines');
					$('.rule-line:last').find('input').each( function() {
						$(this).val('');
					});
					$('.rule-line:last').find('select').each( function() {
						$(this).val('eq');
					});
				}
				
				this.updateState();
				$('.remove-rule').rearrangeRules();
				return false;
			},
			
			onmatch: function() {
				this.updateState();
			},

			updateState: function() {
				if($('#DefaultOption').is(':checked')) {
					this.hide();
					return;
				} 

				if($('.rule-line').length == 4) this.hide();
				else this.show();
			}
		});

		$('.param-one input, .param-one select').entwine({
			onmatch: function() {
				this._super();

				if(this.hasClass('actual')) this.hide();
			}
		});

		$('.param-one .actual').entwine({
			updateValue: function(e) {
				var val = '',
					parent = this.parents('.param-one'),
					mockTextField = parent.find('.mock-textfield'),
					mockDropdown = parent.find('.metadata-dropdown');

				// Get value from the meta data dropdown
				val = mockDropdown.val(); 

				// Get value from the mock text field 
				if(mockTextField.val()) val = val.replace(/\..*$/, '') + '.' +  mockTextField.val();

				this.val(val);
			}
		});

		$('.param-one .mock-textfield').entwine({
			onmatch: function() {
				this.updateVisibility();
			}, 

			onchange: function() {
				this.siblings('.actual').updateValue();
			},

			updateVisibility: function() {
				var parent = this.parents('.param-one'),
					dropdown = this.siblings('.metadata-dropdown'); 
				
				if(dropdown.val().indexOf('*') > -1) {
					parent.addClass('show-mock-textfield');
				}
				else {
					parent.removeClass('show-mock-textfield');
				}
			}
		});

		$('.rule-line .mock-enumfield').entwine({
			onmatch: function() {
				var self = this,
					actual = self.siblings('.actual');

				setTimeout(function() {
					self.updateVisibility(); 
					if(actual.val()) {
						self.val(actual.val());
					}
					else {
						actual.val(self.val());
					}

				}, 200);
			}, 

			onchange: function() {
				this.siblings('.actual').val(this.val());
			},

			updateVisibility: function() {
				var parent = this.parents('.rule-line'),
					selected = parent.find('.metadata-dropdown option:selected'),
					values = selected.attr('data-metadata-enum-values'),
					items = []; 

				if(selected.attr('data-metadata-type') == 'enum') {
					if(values) {
						items = values.split(',');
						this.populateValues(items);
					}

					parent.addClass('show-mock-enumfield');
				}
				else {
					parent.removeClass('show-mock-enumfield');
				}
			},

			/**
			 * @param 	array
			 */
			populateValues: function(items) {
				var html = '',
					value = '';

				for(i = 0; i < items.length; i++) {
					value = $.trim(items[i]);
					html += '<option value="' + value + '">' + value + '</option>';
				}
				
				this.html(html);
			}
		});

		$('.param-one .metadata-dropdown').entwine({
			onmatch: function() {
				var self = this,
					actual = this.siblings('.actual'),
					selected = this.find('option[value="' + actual.val() + '"]'),
					mockTextField = this.siblings('.mock-textfield'),
					actualParts = null,
					combinedPart = '';

				this.setup(); 

				if(selected.length > 0) {
					selected.attr('selected', true);
				}
				else {
					actualParts = actual.val().split('.');

					for(i = 0; i < actualParts.length; i++) {
						combinedPart = ''; 
						for(j = 0; j < actualParts.length - i; j++) {
							combinedPart = combinedPart ? combinedPart + '.' + actualParts[j] : actualParts[j];
						}
						
						selected = this.find('option[value^="' + combinedPart + '"]');
						if(selected.length > 0) {
							mockTextField.val(actual.val().replace(combinedPart + '.', ''));
							selected.attr('selected', true);
							break;
						}
					}
				}

				mockTextField.updateVisibility();

				setTimeout(function() { actual.updateValue(); }, 200);
			}, 

			/**
			 * This method will add metadata type and wildcard flag to the select's options
			 * and also format the options texts
			 */
			setup: function() {
				var options = this.find('option'),
					option = null,
					text = '',
					metadataClass = '',
					match = null,
					classPattern = /\[(\w*)\]/,
					enumValPattern = /\{([\w,-]*)\}/;

				for(i = 0; i < options.length; i++) {
					option = $(options[i]);
					text = option.text();
					classMatch = text.match(classPattern),
					enumValMatch = text.match(enumValPattern);

					// Set metadata type in the html data attribute
					if(classMatch && classMatch.length === 2) {
						text = text.replace(classPattern, '');
						option
							.text(text)
							.attr('data-metadata-type', classMatch[1].toLowerCase());
					}  

					// Set metadata enum values in the html data attribute
					
					if(enumValMatch && enumValMatch.length === 2) {
						text = text.replace(enumValPattern, '');
						option
							.text(text)
							.attr('data-metadata-enum-values', enumValMatch[1]);
					}  					

					// Sett namespace with wildcard to html data attribute
					if(text.indexOf('.*') > -1) {
						option
							.text(text.replace('.*', ''))
							.attr('data-metadata-wildcard', true);
					}
				}
			}, 

			onchange: function() {
				var parent = this.parents('.rule-line'),
					actual = parent.find('.actual'),
					param2Actual = parent.find('.param-two .actual'),
					mockTextField = parent.find('.mock-textfield'),
					mockEnumField = parent.find('.mock-enumfield');

				param2Actual.val('');


				mockTextField.val('');
				mockEnumField.val('');
				actual.updateValue();

				mockTextField.updateVisibility();
				mockEnumField.updateVisibility();
			}
		});

		$('.cms-edit-form .Actions input.action[type=submit], .cms-edit-form .Actions button.action').entwine({
			/**
			 * Function: onclick
			 */
			onclick: function(e) {
				this.convertToString(this.parents('form'));
				if(!this.is(':disabled')) {
					this.parents('form').trigger('submit', [this]);
				}
				e.preventDefault();
				return false;
			},
			convertToString: function(form) {
				
				var resp = '[';
				if(form.find('#DefaultOption').is(':checked') || $('#isDefaultAlready').length > 0) {
					resp += '{"_className":"BasicPersonalisationCondition","operator":"always",';
					resp += '"param1":{"_className":"BasicPersonalisationValue","kind":"P","value":""},';
					resp += '"param2":{"_className":"BasicPersonalisationValue","kind":"L","value":""}},';
				} else {
					var i = 1;
					form.find('.rule-line').each( function() {
						resp += '{"_className":"BasicPersonalisationCondition","operator":"' + $(this).find('#Operator_'+i).val() + '",';
						resp += '"param1":{"_className":"BasicPersonalisationValue","kind":"P","value":"' + $(this).find('#Param1_'+i).val() + '"},';
						resp += '"param2":{"_className":"BasicPersonalisationValue","kind":"L","value":"' + $(this).find('#Param2_'+i).val() + '"}},';
						i++;
					});
				}
				resp = resp.substring(0, resp.length - 1);
				if(resp.length > 0) resp += ']';
				else resp = '';
				
				form.find('input[name=EncodedCondition]').val(resp);
			}
		});

		//remove any empty values from drop down.
		$("#Form_ItemEditForm_ParentID").entwine({
			onmatch: function(){
				$("#Form_ItemEditForm_ParentID option[value='']").remove();
				var lastID = null;
			}
		});


		$('.ss-gridfield-items').entwine({
			onmatch: function() {
				// find
				var self = this;
				this.sortable({
					stop: function( event, ui ) {
						
						if(ui.item.find('.rule-operator').text() == 'always') {
							alert('Sorry but the default rule is not sortable and must always be last');
							$(this).sortable( "cancel" );	
						} else {
							var defaultElementID = null;
							var rulesIDs = '';
							var lastID = null;
							var zebra = 'odd';

							$('.ss-gridfield-items tr h3').each( function(){
								if($(this).parents('tr').find('.rule-operator').text() == 'always') defaultElementID = $(this).attr('data-rule-id');	
								rulesIDs += $(this).attr('data-rule-id') + ',';
								$(this).parents('tr').removeClass('odd even');
								$(this).parents('tr').addClass(zebra);
								zebra = (zebra == 'odd') ? 'even' : 'odd';
								lastID = $(this).attr('data-rule-id');
							});
							
							if(!!defaultElementID && lastID != defaultElementID) {
								alert('Sorry but the default rule must always be last');
								$(this).sortable( "cancel" );	
								// and now we need to update the priority in the template again
								var priority = 1;
								var zebra = 'odd';
								$('.ss-gridfield-items tr h3').each( function(){
									$(this).parents('tr').removeClass('odd even');
									$(this).parents('tr').addClass(zebra);
									zebra = (zebra == 'odd') ? 'even' : 'odd';
									rulesIDs += $(this).attr('data-rule-id') + ',';
								});
							}
							$.ajax({
								url: 'personalisationruleshelper/on_after_sort',
								type: 'POST',
								data: 'ruleIDs=' + rulesIDs.substring(0,rulesIDs.length-1),
								success: function(data){
									// data = JSON.parse(data);
									// if(data.type == 'good') {
									// 	self.find('span.text').text(' ' + data.message); 
									// 	self.attr('href', data.buttonLink); 
									// }
									
								}
							});
						}
					}
				});
			}
		});
	});


	$('#ImageType').entwine({
		onmatch: function(){
			$(this).showHideOptions();
		},
		onchange:  function(){
			$(this).showHideOptions();
		},
		showHideOptions: function(){
			if($("#Form_ItemEditForm_ImageType").val() == 1){
				$('#PersonalisationSchemeID').hide();
				$('#HeroImage').show();
			}else{
				$('#PersonalisationSchemeID').show();
				$('#HeroImage').hide();
			}
		}
	});

	$('#LinkType').entwine({
		onmatch: function(){
			$(this).showHideOptions();
		},
		onchange:  function(){
			$(this).showHideOptions();
		},
		showHideOptions: function(){
			if($("#Form_ItemEditForm_LinkType").val() == 1){
				$('#Link').hide();
				$('#InternalLinkID').show();
			}else{
				$('#Link').show();
				$('#InternalLinkID').hide();
			}
		}
	});


})(jQuery);