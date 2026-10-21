<template>
  <v-app>
   <v-main>
    <main-menu ref="MainMenu" @updateModel="setModel" @saveFile="saveData" />
    <v-container>
        <v-card flat>
          <v-card-text>
              <v-form v-model="valid">
                <v-jsf v-model="model" :schema="schema" />
              </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import VJsf from '@koumoul/vjsf/lib/VJsf.js'
import '@koumoul/vjsf/lib/VJsf.css'
import '@koumoul/vjsf/lib/deps/third-party.js'
import MainMenu from './components/MainMenu.vue'
import { stringify } from "yaml";
import { formToMcf, newRecord, MCF_SECTIONS } from "@/scripts/helpers.js";
import "@/scripts/helpers.css";

// Which metadata model the form uses: "mcf" (default), "ogcapi-record" or "datapackage".
// The load/save conversions in helpers.js are written for MCF.
const vocab = "mcf";

const mdl = require('./models/'+vocab+'/model.json');
const tpl = require('./models/'+vocab+'/template.json');

export default {
  name: 'App',
  components: {
    'MainMenu': MainMenu,
    'VJsf': VJsf
  },
  data: () => ({
    valid: false,
    model: newRecord(tpl),
    schema: mdl
  }),
  methods: {
    download (data, ext) {
      const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
      const a = document.createElement('a');
      const id = (this.model.metadata && this.model.metadata.identifier) || 'metadata';
      a.download = id + "." + ext;
      a.href = window.URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(a.href), 1000);
    },
    setModel (mdl, replace) {
      // File > New: start again from the template
      if (!mdl || Object.keys(mdl).length === 0) {
        this.model = newRecord(tpl);
        return;
      }
      // File > Open: show exactly what is in the file
      if (replace) {
        this.model = mdl;
        return;
      }
      // Imported content: merge it into the current record,
      // section by section, so imports only overwrite what they provide
      const merged = Object.assign({}, this.model);
      MCF_SECTIONS.forEach(function (s) {
        if (mdl[s]) {
          merged[s] = Object.assign({}, merged[s] || {}, mdl[s]);
        }
      });
      this.model = merged;
    },
    saveData(mode) {
      let self = this;
      if (!mode){
        mode = 'mcf';
      }
      const toExp = formToMcf(this.model);
      if (mode=='mcf'){
        self.download(stringify(toExp), 'yml');
      } else {
        // Sent as text/plain to avoid a CORS preflight: the pygeoapi demo
        // server does not allow the Content-Type header in preflight responses.
        this.axios.post("https://demo.pygeoapi.io/master/processes/pygeometa-metadata-generate/execution", JSON.stringify({
          "inputs": {
            "mcf": toExp,
            "schema": mode
          }
        }),{
          headers: {'Content-Type': 'text/plain', 'Accept': 'application/json'}
        }).then(function(response){
          //todo: build some check to evaluate if the content is of expected type

          if (typeof response.data === 'object'){
            self.download(JSON.stringify(response.data), 'json');
          } else {
            self.download(response.data, 'xml');
          }
        }).catch(function (error) {
          alert(error);
        })
      }
    }
  }
};

</script>

