(function ($, BB, _) {

	//$('#add_comment').tooltip();

	var App = Backbone.View.extend({
		el: "#comments",
		events: {
			'click #add_comment': 'addComment'
		},
		initialize: function () {
			this.$input_author = $('.field input[name=author]');
			this.$input_message = $('.field textarea[name=message]');
			this.$comments_list = $('ul#comment_list');
	
			this.listenTo(this.collection, 'add', this.createView);
			this.collection.fetch();
		},
		addComment: function (evt) {
			
			var _this = this;

			var comment = new CommentModel({
				author: this.$input_author.val(),
				message: this.$input_message.val(),
			});
			//alert(JSON.stringify(comment));
			this.collection.add(comment);
			comment.save(null, {
				success: function (model, resp, options) {
					_this.collection.add(model);
				}, 
				error: function (model, xhr, options) {
					alert('Error on save');
				}
			});
		
			//var view = new CommentView({model: comment});
			//this.$comments_list.append(view.render().el);
		},
		createView: function (model, collection) {
			var view = new CommentView({model: model});
			this.$comments_list.append(view.render().el);
		}

	});

	var CommentModel = Backbone.Model.extend({
		defaults: {
			'author': '-',
			'message': '-',
			'date': new Date(),
			'upvotes': 0
		},
		url: function () {
			var location = 'http://localhost:9090/comments';
			//return this.id ? (location + '/' + this.id) : location;
			return location;

		},
		initialize: function () {
			this.validKeys = ['author', 'message'];
		},
		// Checks if the new attributes are similar to the current attributes
		// Returns: true if all or one attr has changed
		// false if none is changing
		attrChanged: function (newAttr) {
			var changed = _.isEqual(_.pick(this.attributes, this.validKeys), newAttr);
			return !changed;
		}
	});

	var CommentCollection = Backbone.Collection.extend({
		model: CommentModel,
		
		url: 'http://localhost:9090/comments',
		initialize: function () {

		}
	});

	var CommentView = Backbone.View.extend({
		tagName: 'li',
		template: $('#comment-template').html(),
		events: {
			'click .upvotes': 'addVotesToAuthor',
			'click .delete': 'deleteFromDatabase'
		},
		initialize: function() {
			// Triggers after a model is deleted in the database
			this.listenTo(this.model, 'destroy', this.removeView);
			// Triggers after a model's field changed or updated in the database
			//this.listenTo(this.model, 'change', this.showDefaultView);
		},
		deleteFromDatabase: function () {
			alert("please delete");
			this.model.destroy({
				wait: true,
				success: function (model, resp, opt) {
					console.log('model destroy success: ', model);
				},
				error: function (model, xhr, opt) {
					console.log('model destroy error: ', model);
				}
			})
		},
		saveChangesToDatabase: function () {
			var newAttrs = {
				author: this.$el.find('a[class=author]').val(),
				message: this.$el.find('div[name=text]').val(),
				upvotes: this.$el.find('span[class="score details"]').val()
			}

			if (!this.model.attrChanged(newAttrs)) {
				this.showDefaultView();
			} else {
				this.model.save(newAttrs, {
					wait: true,
					success: function (model, resp, opt) {
						console.log('model update success: ', model);
					},
					error: function (model, xhr, opt) {
						console.log('model update error: ', model);
					}
				});
			}
		},
		showDefaultView: function () {
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()));
			
		},
		removeView: function () {
			this.undelegateEvents();
			this.stopListening();
			this.remove();
		},
		render: function() {
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()))
			return this;
		}
	});

	var contactApp = new App({collection: new CommentCollection()});



})(jQuery, Backbone, _)