console.log("alt-input");

var template = `
<input ref="input" class="form-control" v-bind="$props" :name="name" :type="type" :value="value" @input="onInput" />
`;

Vue.component("alt-input", {
    template: template,
    props: {
        type: String,
        name: String,
        required: Boolean,
        value: String
    }, mounted() {
        if (this.required) {
            $(this.$el).after('<i class="fa fa-asterisk form-control-feedback" style="top:10px"></i>');

            $(this.$el).closest(".form-group").addClass("has-feedback");
            if ($(this.$el).closest(".form-group").length == 0) {
                $(this.$el).css("margin-bottom", "0px");

                $(this.$el).addClass("form-group has-feedback");
            }
            //   $(this.$el).closest("form").validate()
        }
    }, methods: {
        onInput(event) {
            this.$emit("input", event.target.value);

            //this.$emit("input",);
        }
    }
});