var DVM = {};

$(function() {
    function Graph(targets, settings) {
        var self = this;
        var defaultSettings = {
            'areaMode': 'none',
            'height': 330,
            'hideLegend': '',
            'lineMode': '',
            'width': 665,
            'yMin': '',
            'yMax': '',
            'from': DVM.from(),
            'until': DVM.until(),
        };

        self.addTarget = function(path) {
            path = typeof path === 'object' ? '' : path;
            self.graphTargets.push({'path': path});
        }

        self.showGraphModal = function(selector) {
            DVM.graph(self);
            $(selector).modal();
        }

        self.removeTarget = function(target) {
            self.graphTargets.remove(target);
        }

        self.saveTargets = function(graph) {
            DVM.graph().graphTargets(graph.graphTargets());
        }

        settings = $.extend({}, defaultGraph['settings'], settings);
        settings = $.extend({}, defaultSettings, settings);
        self.settings = ko.mapping.fromJS(settings, {});

        self.settings.from = ko.computed(function() {
            return DVM.from();
        });
        self.settings.until = ko.computed(function() {
            return DVM.until();
        });

        targets = (typeof targets === 'undefined' || targets.length == 0) ? defaultGraph['targets'] : targets;
        self.graphTargets = ko.observableArray();

        for (var i = 0; i < targets.length; i++) {
            if (targets[i].hasOwnProperty('path')) {
                    if (typeof targets[i]['path'] == 'function') {
                        self.addTarget(targets[i]['path']());
                    } else {
                        self.addTarget(targets[i]['path']);
                    }
            } else {
                self.addTarget(targets[i]);
            }
        }

        self.graphUrl = ko.computed(function() {
            var params = []
            for (var opt in self.settings) {
                if (self.settings.hasOwnProperty(opt) && opt !== '__ko_mapping__' && opt.length > 0) {
                    params.push(opt+'='+encodeURIComponent(self.settings[opt]()));
                }
            }
            self.graphTargets().map(function(target) {
                if (target.hasOwnProperty('path') && target['path'].length > 0) {
                    params.push('target='+encodeURIComponent(target['path']));
                }
            });
        
            return graphiteUrl+'/render?'+params.join('&');
        });

        self.spanClass = ko.computed(function() {
            switch (self['settings'].width())
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

    var DashboardViewModel = function(dashboardData) {
        var self = this;

        if (!$.isEmptyObject(dashboardData)) {
            self = ko.mapping.fromJS(dashboardData);
        }

        if (!self.hasOwnProperty('name')) {
            self.name = ko.observable();
        }
        if (!self.hasOwnProperty('from')) {
            self.from = ko.observable('-1h');
        }
        if (!self.hasOwnProperty('until')) {
            self.until = ko.observable('now');
        }
        if (!self.hasOwnProperty('areaModes')) {
            self.areaModes = [
                'none',
                'first',
                'stacked'
            ];
        }
        if (!self.hasOwnProperty('lineModes')) {
            self.lineModes = [
                'slope',
                'staircase',
                'connected'
            ];
        }
        if (!self.hasOwnProperty('rows')) {
            self.rows = ko.observableArray();
        }
        if (!self.hasOwnProperty('id')) {
            self.id = ko.observable();
        }

        self.graph = ko.observable();

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
                graphs.push(new Graph([], {'width': width}));
            }

            DVM.rows.push({graphs: graphs});
        }

        self.saveDashboard = function(id) {
            dashboard = DVM;
            delete dashboard['__ko_mapping__'];
            var dashboardObj = {
                id: id,
                dashboard: ko.mapping.toJSON(dashboard)
            };

            $.post('/dashboard/save', dashboardObj, function(postData) {
                self.id(postData.message);
                $('#dashboard-link-modal').modal();
            });
        }

        return self;
    }

    var mapping = {
        rows: {
            create: function(row) {
                if (typeof row.data === 'object') {
                    var graphs = [];

                    for (var i = 0; i < row.data.graphs().length; i++) {
                        graphs.push(new Graph(row.data.graphs()[i].graphTargets(),
                                              row.data.graphs()[i].settings,
                                              DVM));
                    }

                    row.data.graphs(graphs);
                }

                return row.data;
            }
        }
    };

    DVM = new DashboardViewModel(dashboard);
    DVM = ko.mapping.fromJS(DVM, mapping);
    ko.applyBindings(DVM);

    ko.bindingHandlers.typeahead = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).typeahead({
                source: function(query, typeahead) {
                    $.getJSON('/metrics/search/'+query, function(data) {
                        return(typeahead(data.message));
                    });
                }
            });
        }
    };

    $('input.search-query').typeahead({
        highlighter: function (item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
            return item.name.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return('<strong>'+match+'</strong>');
            })
        },
        matcher: function(item) {
            return(~item.name.toLowerCase().indexOf(this.query.toLowerCase()));
        },
        sorter: function(items) {
            var beginswith = [],
                caseSensitive = [],
                caseInsensitive = [],
                item;

            while (item = items.shift()) {
                if (!item.name.toLowerCase().indexOf(this.query.toLowerCase())) {
                    beginswith.push(item);
                } else if (~item.name.indexOf(this.query)) {
                    caseSensitive.push(item);
                } else {
                    caseInsensitive.push(item);
                }
            }

            return(beginswith.concat(caseSensitive, caseInsensitive));
        },
        source: function(query, process) {
            $.getJSON('/dashboard/search/'+query, function(data) {
                return(process(data.message));
            });
        }
    });

    $('input.search-query').data('typeahead').render = function(items) {
        var that = this;

        items = $(items).map(function (i, item) {
            i = $(that.options.item).attr('data-value', item.name);
            i.find('a').html(that.highlighter(item)).attr('data-dashboard', item.id);
            return(i[0]);
        })

        items.first().addClass('active');
        this.$menu.html(items);
        return(this);
    };

    $('input.search-query').data('typeahead').select = function() {
        var id = this.$menu.find('.active').find('a').attr('data-dashboard');
        return window.location = '/dashboard/'+id;
    };
    $('.pagination .disabled a, .pagination .active a').on('click', function(e) {
        e.preventDefault();
    });

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
