$(function() {
    function Graph(viewModel, targets, options) {
        var self = this;
        var vm = viewModel;
        var defaultOptions = {
            'width': 665,
            'height': 330,
            'from': vm.from(),
            'until': vm.until()
        };

        targets = typeof targets !== 'undefined' ? targets : [];
        self.targets = targets.length > 0 ? targets : defaultGraph['targets'];
        self.options = $.extend({}, options, defaultGraph['options'])

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
            self.targets.map(function(target){ params.push('target='+encodeURIComponent(target)); });
        
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
    }

    function DashboardViewModel() {
        var self = this;

        self.from = ko.observable('-1h');
        self.until = ko.observable('now');
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
    }

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
