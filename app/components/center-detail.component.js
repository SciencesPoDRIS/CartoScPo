/* globals angular, _, commonmark */
'use strict';

angular.module('bib.components').component('centerDetail', {
  templateUrl: 'views/center-detail.html',
  bindings: {
    // can't use "center", it's already taken by Leaflet
    org: '<',
    expanded: '<',
    onToggle: '<'
  },
  controller: function(backOfficeBaseUrl) {
    this.toggle = function() {
      /**
       * This weirdly fixes #69, I don't really have a clear idea of the WHY
       * But here is the HOW:
       * - at load-time, 'ng-class={ in: $ctrl.expanded }' works properly
       * - at runtime, when calling 'onToggle', all the values are *properly* updated
       *   every console.log shows what it's supposed to, expanding values in the templates
       *   show correct value BUT for some dark magic reason, the class is not properly computed.
       *   It works if we replace '$ctrl.expanded' by 'expanded' (BUT WHY???) but then it breaks init.
       *   It also works if we just *invert* the boolean when the handler has been called, which is
       *   what 'toggled' is for.
       * Dark magic not mastered, but bug fixed.
       */
      this.toggled = true;
      this.onToggle(this.org.id);
    };

    this.$onInit = function() {
      // TODO more predictable destructuring
      Object.keys(this.org).forEach(function(key) {
        this[key] = this.org[key];
      }, this);

      // Convert markdown to html
      var reader = new commonmark.Parser();
      var writer = new commonmark.HtmlRenderer();

      function convert(fields) {
        if (!fields) return '';
        var acc = '';
        fields = fields.replace(/\n/g, '\n\n');
        if (Array.isArray(fields)) {
          _.forEach(fields, function(d) {
            acc = acc.concat(d) + ' \n';
          });
          return writer.render(reader.parse(acc));
        } else {
          return writer.render(reader.parse(fields));
        }
      }

      this.boHref = `${backOfficeBaseUrl}/centers/${this.org.id}`;

      // Administration
      this.history = convert(this.org.history);
      // Recherche
      this.research_areas = convert(this.org.research_areas);
      this.contracts = convert(this.org.contracts);
      this.workshops = convert(this.org.workshops);
      this.partners = convert(this.org.partners);
      this.subject_terms = convert(this.org.subject_terms);
      // Publications
      this.collections_titles = convert(this.org.collections.titles);
      this.journal_titles = convert(this.org.journal.titles);
      this.oa_policy = convert(this.org.oa_policy);
      this.data_repository_projects = convert(
        this.org.data_repository.projects
      );
      this.valorisation = convert(this.org.valorisation);
      // Documentation
      this.eresources = convert(this.org.resources);
      this.library_staff = convert(this.org.library_staff);
      this.information_skills_training = convert(
        this.org.information_skills_training
      );
      this.used_librairies = convert(this.org.used_librairies);
      this.library_titles = convert(this.org.library.titles);
      this.library_description = convert(this.org.library_description);
      this.library_policy = convert(this.org.library_policy);
      this.libraries_network_list = convert(this.org.libraries_network_list);
    }.bind(this);
  }
});
