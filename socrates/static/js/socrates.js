$(function() {
    function Graph(vm, targets, options) {
        var self = this;
        var defaultOptions = {
            'width': 665,
            'height': 330
        };

        self.targets = (typeof targets === 'undefined' || targets.length == 0) ? defaultGraph['targets'] : targets;
        self.options = $.extend({}, defaultGraph['options'], options);

        self.graphTargets = ko.observableArray();
        for (var i = 0; i < targets.length; i++) {
            self.graphTargets.push({'path': targets[i]});
        }

        self.graphOptions = ko.computed(function() {
            self.options['from'] = vm.from();
            self.options['until'] = vm.until();
            return $.extend({}, defaultOptions, self.options);
        });

        self.graphUrl = ko.computed(function() {
            var params = []
            for (var opt in self.graphOptions()){
                if (self.graphOptions().hasOwnProperty(opt)) {
                    params.push(opt+'='+encodeURIComponent(self.graphOptions()[opt]));
                }
            }
           self.graphTargets().map(function(target) {
                params.push('target='+encodeURIComponent(target['path']));
            });
        
            return graphiteUrl+'/render?'+params.join('&');
        });

        self.spanClass = ko.computed(function() {
            switch (self.graphOptions()['width'])
            {
            case 665:
                return 'graph span6';
                break;
            default:
                return 'graph span12';
                break;
            }
        });

        self.showGraphModal = function(selector) {
            vm.graph(self);
            $(selector).modal();
        }

        self.saveTargets = function(graph) {
            self.graphTargets(graph.graphTargets());
        }
    }

    function DashboardViewModel() {
        var self = this;

        self.name = ko.observable();
        self.from = ko.observable('-1h');
        self.until = ko.observable('now');
        self.graph = ko.observable();
        self.rows = ko.observableArray([{
            graphs: [
                new Graph(self, [], {}),
                new Graph(self, [], {})
            ]
        }]);

        self.addRow = function(numGraphs) {
            var graphs = [];

            switch (numGraphs)
            {
            case 1:
                width = 1350;
                break;
            case 2:
                width = 665;
                break;
            }

            for (var i = 0; i < numGraphs; i++) {
                graphs.push(new Graph(self, [], {'width': width}));
            }

            self.rows.push({graphs: graphs});
        }

        self.updateFrom = function(from) {
            self.from(from);
        }
    };

    ko.applyBindings(new DashboardViewModel());

    $('div.btn-group[data-toggle-name=current-toggle]').each(function(){
        var group   = $(this);
        var name    = group.attr('data-toggle-name');
        $('button', group).each(function(){
            var button = $(this);
            button.live('click', function(){
                if (button.val() == 'current') {
                    $('div.form-inline[data-toggle-name=custom-range]').addClass('hide');
                    $('div.btn-group[data-toggle-name=from-buttons]').removeClass('hide');
                } else {
                    $('div.btn-group[data-toggle-name=from-buttons]').addClass('hide');
                    $('div.form-inline[data-toggle-name=custom-range]').removeClass('hide');
                }
            });
        });
    });

    $('div.btn-group[data-toggle-name=select-from]').each(function(){
        var group   = $(this);
        var name    = group.attr('data-toggle-name');
        $('button', group).each(function(){
            var button = $(this);
            button.live('click', function(){
                console.log(button.val());
            });
        });
    });
});
