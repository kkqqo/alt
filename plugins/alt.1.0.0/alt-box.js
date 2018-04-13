Vue.component("alt-box", {
    template: `
<div class="box" :class="{'collapsed-box':collapsed}">

    <div class="overlay" v-if="loading">
        <i class="fa fa-spin fa-sync-alt"></i>
    </div>

    <slot></slot>
</div>    
`,
    data: function () {
        return {
            loading: false
        }
    },
    computed: {
        header() {
            return this.$slots.default.filter(o => {
                if (o.componentOptions == undefined) return false;
                return o.componentOptions.tag == "alt-box-header";
            }).map(o => {
                return o.componentInstance;
            });
        }, body() {
            return this.$slots.default.filter(o => {
                if (o.componentOptions == undefined) return false;
                return o.componentOptions.tag == "alt-box-body";
            }).map(o => {
                return o.componentInstance;
            });
        }, footer() {
            return this.$slots.default.filter(o => {
                if (o.componentOptions == undefined) return false;
                return o.componentOptions.tag == "alt-box-footer";
            }).map(o => {
                return o.componentInstance;
            });
        }
    },
    mounted() {
        this.header.forEach(h => {
            h.collapsible = this.collapsible;
            h.closeable = this.closeable;
            h.collapsed = this.collapsed;
            h.dataUrl=this.dataUrl;
        });

        this.header.forEach(h => {
            h.$on("collapsed", (collapsed) => {
                var data = {};
                data.type = "box";
                data.layout = {
                    collapsed: collapsed
                };
                data.uri = this.dataUri;

                this.$http.post("UI/save", data);

                this.body.forEach(e => {
                    if (collapsed) {
                        $(e.$el).slideUp(500);
                    } else {
                        $(e.$el).slideDown(500);
                    }
                });
                this.footer.forEach(e => {
                    if (collapsed) {
                        $(e.$el).slideUp(500);
                    } else {
                        $(e.$el).slideDown(500);
                    }
                });
            });

            h.$on("acl", (acl) => {
                var data = acl;
                data.path = this.dataAclUri;
                this.$http.post("ACL/box", data);
            });
        })
    },
    props: {
        collapsible: Boolean,
        collapsed: Boolean,
        closeable: Boolean,
        acl: Boolean,
        aclGroup: Array,
        dataUri: String,
        dataAclUri: String,
        dataUrl: String
    },
    methods: {
        reload:function(){
            this.showLoading();
            this.$http.get(this.dataUrl).then(resp=>{
                this.hideLoading();
                console.log(this.body[0]);
                this.body[0].setContent(resp.body);
            });
            
        },
        showLoading: function () {
            this.loading = true;
        }, hideLoading: function () {
            this.loading = false;
        }
    }
});

Vue.component("alt-box-body", {
    template: `
<div class="box-body">
    <div v-if="content"v-html="content"></div>
    <slot v-else></slot>
</div>
`,
    data(){
        return {
            content:null
        }
    },
    methods:{
        setContent(content){
            this.content=content;
        }
    }

});


Vue.component("alt-box-footer", {
    template:`
    <div class="box-footer">
        <slot></slot>
    </div>
`
});

Vue.component("alt-box-header", {
    template: `
<div class="box-header">
    <h3 class="box-title">
        <i v-if="icon" :class="icon"></i> {{title}}
        <slot></slot>
    </h3>
    <div class="box-tools pull-right">
        <slot name="tools"></slot>

        <button v-if="dataUrl" type="button" class="btn btn-box-tool" @click="$parent.reload()">
            <i class="fa fa-sync-alt"></i>
        </button>

        <div class="btn-group" v-if="acl_group">
            <button type="button" class="btn btn-box-tool dropdown-toggle" data-toggle="dropdown">
                <i class="fa fa-lock"></i>
            </button>
            <ul class="dropdown-menu pull-right" role="menu">
                <li v-for="acl in acl_group" :class="{checked:acl.selected,disabled:acl.disabled}">
                    <a href="#" @click.prevent="aclClicked(acl)">
                        <i class="fa fa-check"></i>{{acl.name}}</a>
                </li>
            </ul>
        </div>

        <button v-if="pinable" type="button" class="btn btn-box-tool" @click="togglePin()">
            <i class="fa" :class="[pinned?'fa-thumbtack':'fa-arrows-alt']"></i>
        </button>

        <button v-if="collapsible" type="button" class="btn btn-box-tool" @click="toggleCollapse()">
            <i class="fa" :class="[collapsed?'fa-plus':'fa-minus']"></i>
        </button>

        <button v-if="closeable" type="button" class="btn btn-box-tool" data-widget="remove" @click="$emit('closed')">
            <i class="fa fa-times"></i>
        </button>
    </div>
</div>    
`,
    props: {
        title: String,
        pinable: Boolean,
        acl: Boolean,
        aclGroup: Array,
        icon: String
    },
    data() {
        return {
            dataUrl:"",
            collapsible: false,
            collapsed: false,
            closeable: false,
            pinned: true,
            acl_group: this.aclGroup
        }
    },
    mounted() {

    }, methods: {
        togglePin() {
            this.pinned = !this.pinned;
            this.$emit("pinned", this.pinned);
        },
        toggleCollapse() {
            this.collapsed = !this.collapsed;
            this.$emit("collapsed", this.collapsed);
        },
        aclClicked: function (acl) {
            acl.selected = !acl.selected;
            this.$emit("acl", acl);
        }
    }
});