(function main() {

  // Types of statistics that are suitable for graphing
  var STAT_TYPES = [
    'mp', 'fg', 'fga', 'fg%', '3p', '3pa', '3p%', 'ft', 'fta', 'ft%','orb',
    'drb', 'trb', 'ast', 'stl', 'blk', 'tov', 'pf', 'pts', 'gmsc', 'ts%',
    'efg%', 'orb%', 'drb%', 'trb%', 'ast%', 'stl%', 'blk%', 'tov%','usg%',
    'ortg', 'drtg', 'g', 'gs', 'ows', 'dws', 'ws', 'ws/48', 'obpm', 'dbpm',
    'bpm', 'vorp', 'per', '3par', 'ftr',
    // Shooting stats
    'fg_pct', 'avg_dist', 'fg2a_pct_fga', 'pct_fga_00_03', 'pct_fga_03_10',
    'pct_fga_10_16', 'pct_fga_16_XX', 'fg3a_pct_fga', 'fg2_pct', 'fg_pct_00_03',
    'fg_pct_03_10', 'fg_pct_10_16', 'fg_pct_16_XX', 'fg3_pct', 'fg2_pct_ast',
    'pct_fg2_dunk', 'fg2_dunk', 'fg3_pct_ast', 'pct_fg3a_corner', 'fg3_pct_corner',
    'fg3a_heave', 'fg3_heave'
  ]

  var INFO_TYPES = ['opp', 'date', 'season']

  var NO_KEY = '----'

  // Helper for use in event bindings
  var bind = function(func, context) {
    return Function.prototype.bind.apply(func, [].slice.call(arguments, 1))
  }

  var format = d3.time.format('%Y-%m-%d')

  // Build or show the chart
  //
  // container - The container holding the table
  // table     - The statistics table
  function showChart(container, table) {
    var width = table.node().offsetWidth,
        height = 400

    if (table.node().querySelectorAll('tbody tr').length > 60)
      width = 1168

    table.style('display', 'none')

    if (container.select('div.graph').node() == null) {
      var data = toData(table),
          name = d3.select('#page_content div.freeze_bar ul.menu span.bold_text').text(),
          stats = d3.keys(data[0]).filter(function(d) { return d != 'info' }),
          padt = 30, padr = 10, padb = 70, padl = 20,
          statKeys = [stats.indexOf('pts') != -1 ? 'pts' : 'mp', NO_KEY],
          curData = filterStats([statKeys[0]], data),
          x = d3.scale.ordinal().rangeRoundBands([0, width], 0.2),
          ys = [d3.scale.linear().range([height, 0]),
                d3.scale.linear().range([height, 0])],
          xAxis = d3.svg.axis().scale(x).tickSize(8).tickFormat(function(i) {
            if (curData[i][0].date != undefined) {
              return d3.time.format('%m/%d')(curData[i][0].date) + ' ' + curData[i][0].opp
            } else {
              return curData[i][0].season
            }
          }),
          yAxes  = [d3.svg.axis().scale(ys[0]).orient("left").tickSize(-width + padl + padr).tickPadding(0),
                    d3.svg.axis().scale(ys[1]).orient("right").tickSize(5).tickPadding(0)]

      var paths = [
        d3.svg.line()
        .x(function(d, i) { return x(i) + x.rangeBand() / 2 })
        .y(function(d) { return ys[0](d) }),
        d3.svg.line()
        .x(function(d, i) { return x(i) + x.rangeBand() / 2 })
        .y(function(d) { return ys[1](d) })]

      var div = container.insert('div', '.margin.padding')
        .attr('class', 'graph')
        .style('width', width + padl + padr + 'px')
        .style('border', '1px solid #ccc')
        .style('padding', '0')

      var h3 = div.append('h3')
        .style('padding', '10px')
        .style('border-bottom', '1px solid #ccc')
        .style('margin', 0)

      h3.append('span')
        .attr('class', 'player')
        .text(name + ": ")

      var subject = h3.append('span')
        .attr('class', 'subject')

      var subSelect = h3.append('select')
        .style('float', 'right')

      subSelect.selectAll('option')
        .data(["----"].concat(stats))
        .enter().append('option')
        .text(function(d) { return d })
        .attr('selected', function(d) { return d == statKeys[1] ? 'selected' : null })

      h3.append('span')
        .attr('class', 'stat-label')
        .style('float', 'right')
        .text('Second stat:')

      var select = h3.append('select')
        .style('float', 'right')

      select.selectAll('option')
        .data(stats)
        .enter().append('option')
        .text(function(d) { return d })
        .attr('selected', function(d) { return d == statKeys[0] ? 'selected' : null })

      h3.append('span')
        .attr('class', 'stat-label')
        .style('float', 'right')
        .text('First stat:')

      var vis = div.append('svg')
        .attr('class', 'bbref-chart')
        .attr('width', width + padl + padr)
        .attr('height', height + padt + padb)
      .append('g')
        .attr('transform', 'translate(' + padl + ',' + padt + ')')

      vis.append("g")
        .attr("class", "y axis chart1")

      vis.append("g")
        .attr("class", "y axis chart2")
        .attr('transform', 'translate(' + (width - 15) + ', 0)')

      vis.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')

      vis.append('path')
        .attr('class', 'average chart1')
      vis.append('path')
        .attr('class', 'average chart2')

      function render(stats, entries) {

        x.domain(d3.range(entries.length))
        vis.select('.x.axis').call(xAxis)
        vis.selectAll('.x.axis text')
          .attr('transform', 'translate(' + -((x.rangeBand() / 2) + 10) + ',30), rotate(-65)')
          .attr('text-anchor', 'end')
        subject.text(stats[0].toUpperCase())
        vis.selectAll('g.bar').remove()
        vis.selectAll('path.average').style('display', 'None')
        vis.selectAll('.y.axis').style('display', 'None')

        var bargroups = vis.selectAll('g.bar')
          .data(entries)

        var g = bargroups.enter().append('g')
          .attr('class', 'bar')
          .attr('transform', function(d, i) { return 'translate(' + x(i) + ',0)'})

        stats.forEach(function(stat, idx) {
          idx = idx + 1

          var max = d3.max(entries, function(d) { return d[idx] }),
              min = d3.min(entries, function(d) { return d[idx] })
              y = ys[idx - 1],
              yAxis = yAxes[idx - 1],
              averages = rollingAverageForStat(entries, idx)

          if (stat.indexOf('%') != -1 && max == 100) {
              y.domain([Math.min(0, min), max])
          } else {
              y.domain([Math.min(0, min), max * 1.1])
          }
          vis.select('.y.axis.chart' + idx)
            .style('display', '')
            .call(yAxis)

          rect = g.append('rect')
            .attr('class', 'chart' + idx)
            .attr('width', x.rangeBand() / stats.length)
            .attr('x', x.rangeBand() * (idx - 1) / 2)

          g.append('text')
            .attr('class', 'barlabel chart' + idx)
            .attr('text-anchor', 'middle')
            .attr('x', x.rangeBand() * ((idx - 1) * 2 + 1) / (2 * stats.length))

          bargroups.select('rect.chart' + idx)
            .attr('height', bind(function(d) { return isNaN(y(d[idx])) ? 0 : height - y(d[idx])}))
            .attr('y', bind(function(d) { return isNaN(y(d[idx])) ? 0 : y(d[idx]) }))

          bargroups.select('text.chart' + idx)
            .text(function(d) { return d[idx] })
            .style('display', bind(function(d) {
              if (isNaN(d[idx])) return 'none'
            }))

          if (entries.length > 40) {
            bargroups.select('text.chart'+ idx)
              .attr('transform', 'rotate(-90)')
              .attr('text-anchor', 'start')
              .attr('x', bind(function(d) { return isNaN(y(d[idx])) ? 0 : -y(d[idx]) + 5 }))
              .attr('y', (x.rangeBand() + 2 * stats.length) / (1.5 * stats.length) + x.rangeBand() * (idx -1) / 2 )
          } else {
            bargroups.select('text.chart' + idx)
              .attr('y', bind(function(d) { return isNaN(y(d[idx])) ? 0 : y(d[idx]) - 5 }))
          }

          vis.select('path.average.chart' + idx)
            .attr('d', paths[idx - 1](averages))
            .style('display', '')
        })


        bargroups.exit().remove()
      }

      render([statKeys[0]], curData)

      select.on('change', function(event) {
        statKeys[0] = this.options[this.selectedIndex].text
        var stats = [statKeys[0]]
        if (statKeys[1] != NO_KEY) {
           stats.push(statKeys[1])
        }
        curData = filterStats(stats, data)

        render(stats, curData)
      })

      subSelect.on('change', function(event) {
        statKeys[1] = this.options[this.selectedIndex].text
        if (statKeys[1] != NO_KEY) {
           curData = filterStats(statKeys, data)
           render(statKeys, curData)
        } else {
           var stats = [statKeys[0]]
           curData = filterStats(stats, data)
           render(stats, curData)
        }
      })

    } else {
      container.select('div.graph')
        .style('display', 'block')
    }
  }

  function filterStats(stats, data) {
    return data.map(function(d) {
        var result = []
        var hasValue = false
        stats.forEach(function(stat) {
           if (d[stat] == undefined) {
             result.push(NaN)
           } else {
             result.push(d[stat])
             hasValue = true
           }
        })
        if (hasValue) {
           return [d.info].concat(result)
        } else {
           return [undefined]
        }
     }).filter(function(d) { return d[0] != undefined })
  }

  // Hide the chart
  //
  // container - The container for the table
  // table     - The table holding the statistics
  function hideChart(container, table) {
    table.style('display', 'table')
    container.select('div.graph').style('display', 'none')
  }

  // Chart link was clicked
  //
  // link - the anchor element that triggered the event
  // event - the event object
  function onChartLinkClick(link, event) {
    event.preventDefault()
    var container = d3.select(this.parentNode),
        table = container.select('.stats_table')

    if (table.style('display') == 'none') {
      hideChart.apply(this, [container, table, event])
      link.innerText = 'Chart'
    } else {
      showChart.apply(this, [container, table, event])
      link.innerText = 'Table'
    }
  }

  function minutesToDecimal(val) {
    var mp = val.split(':').map(Number)
    return parseFloat(d3.format('.2f')(((mp[0] * 60) + mp[1]) / 60))
  }

  function percentageToNumber(val) {
    if (val == '') {
      val = NaN
    } else {
      if ((/^\./).test(val) || val == '1.000') {
        val = parseFloat((parseFloat(val) * 100).toPrecision(3))
      } else {
        val = parseFloat(val)
      }
    }

    return val
  }

  function rollingAverageForStat(entries, idx) {
    var values = entries.map(function(d) { return d[idx] }),
        averages = [],
        total    = 0.0
    values.forEach(function(val, idx) {
      if (isNaN(val)) {
        averages.push(averages[averages.length - 1])
      } else {
        total += parseFloat(val)
        averages.push(parseFloat(d3.format('.3f')(total / (idx + 1))))
      }
    })

    return averages
  }
  // Build an array of objects from an HTML table
  //
  // table - d3 selection
  //
  // Returns an array or games [{game}, {game}, ...]
  function toData(table) {
    var multiHeader = table.selectAll('thead tr')[0].length > 1;
    var dateidx = null,
        headers = table.selectAll('thead tr:not(.over_header) th'),
        rows    = table.selectAll('tbody tr'),
        data    = []

    headers.each(function(el, idx) {
      var lbl = this.innerText.toLowerCase();
      if (lbl == 'date' || lbl == 'season')
        dateidx = idx + 1
    })

    // We want to have dates before we decide to continue
    if (!dateidx) {
      return console.log('No Date found in table')
    }

    // Get the stat labels
    var labels = headers.map(function(hdrs) {
      return hdrs.map(function(hdr) {
        if (multiHeader) {
           return hdr.getAttribute('data-stat')
        } else {
           return hdr.innerText.toLowerCase()
        }
      })
    })[0]

    rows.each(function() {
      var obj = {}
      d3.select(this).selectAll('td').each(function(cell, idx) {
        var label = labels[idx],
            val = this.innerText

        if (STAT_TYPES.indexOf(label) != -1) {
          // convert minutes played to decimal
          if (label == 'mp' && val.indexOf(':') != -1) {
            val = minutesToDecimal(val)
          // Convert percentage decimals to integers
          } else if (label.indexOf('%') != -1) {
            val = percentageToNumber(val)
          // Floats strings to floats and number strings to numbers
          } else {
            val = val.indexOf('.') == -1 ? ~~val : parseFloat(val)
          }

          obj[label] = val
        } else if (INFO_TYPES.indexOf(label) != -1) {
          if (typeof obj.info == "undefined") obj.info = {}
          if (label == 'date') val = format.parse(val)
          obj.info[label] = val
        }
      })
      data.push(obj)
    })

    return data
  }

  var headings = document.querySelectorAll('#basic_div .table_heading, ' +
                                           '#advanced_div .table_heading, ' +
                                           '#basic_playoffs_div .table_heading, ' +
                                           '#advanced_playoffs_div .table_heading, ' +
                                           '#all_totals .table_heading, ' +
                                           '#all_per_game .table_heading, ' +
                                           '#all_per_minute .table_heading, ' +
                                           '#all_per_poss .table_heading, ' +
                                           '#all_advanced .table_heading, ' +
                                           '#all_shooting .table_heading, ' +
                                           '#all_playoffs_totals .table_heading, ' +
                                           '#all_playoffs_per_game .table_heading, ' +
                                           '#all_playoffs_per_minute .table_heading, ' +
                                           '#all_playoffs_per_poss .table_heading, ' +
                                           '#all_playoffs_advanced .table_heading'
                                           ),
      i = 0,
      len = headings.length

  for (i; i < len; i++) {
    var heading = headings[i]
        a = document.createElement('a')

    a.innerText = 'Chart'
    a.href = '#chart'
    a.className = 'bbref-chart-link'
    a.addEventListener('click', bind(onChartLinkClick, heading, a))
    heading.appendChild(a)
  }

})()
