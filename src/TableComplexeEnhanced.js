 /*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  'use strict';

  var tableComplexeEnhanced = {};
  tableComplexeEnhanced.cwKendoGrid = {};
  tableComplexeEnhanced.cwKendoGridToolBar = {};

  var TableComplexeEnhancedConfig = {
    itemPerPages : [5, 12, 42,9999],
    title : true,
    clearFilterAtStart : true,
    clearButtonName : 'Clear All Filters',
    exigence_grid : { // nodeID
      heightPercent : 1, // TableSize = size of the window / heightPercent
      column : {
        1 : {order : 7,size : 200},
        2 : {order : 3,size : 200},
        3 : {order : 2,size : 200},
        7 : {order : 1,size : 400} 
      }
    },
    organisation_1624544826 : { // nodeID
      heightPercent : 1, // TableSize = size of the window / heightPercent
      column : {
        1 : {order : 4,size : 100},
        2 : {order : 1,size : 200},
        4 : {order : 2,size : 200} 
      }
    }    
  };



  // remove the special column of the table complexe and replace after the switch
  var clearColumn = function (columns) {
    var columnCleared = [];

    var result = {
      iUpdate : undefined,
      iCreate : undefined,
      columnCleared : columnCleared
    };

    for(i=0;i < columns.length;i++ ) {
      if(columns[i].title === "CanCreate" && columns[i].field === "type_id_cancreate") {
        result.Create = i; 
      } else if(columns[i].title === "CanUpdate" && columns[i].field === "type_id_canupdate") {
        result.Update = i; 
      } else if(columns[i].title === "Options"  && columns[i].field  === undefined) {
        result.Options = i; 
      } else if(columns[i].title === "ID"  && columns[i].field  === "id") {
        result.ID = i; 
      }
      else {
        columnCleared.push(columns[i]);          
      }
    }
    return result;
  };



  var reOrderColumn = function (columns,config) {
    var columnsObj = {};
    var i;
    for(i=0;i < columns.length;i++ ) {
        if(config.hasOwnProperty(i + 1)) {
          columns[i].width = config[i+1].size; // gestion size
          columnsObj[config[i+1].order - 1] = columns[i]; // custom order
        } else {
          columnsObj[i] = columns[i];          
        }
      }    
    return columnsObj;
  };

  var reBuildColumn = function (columnsObj,config,iObject,columnsOrig) {
    var result = [];
    var shift = 0;

    for(i=0;i < columnsOrig.length;i++ ) {
      if(i === iObject.Update || i === iObject.Create || i === iObject.Options || i === iObject.ID) {
        result.push(columnsOrig[i]);
        shift = shift + 1;
      } else if(columnsObj.hasOwnProperty(i - shift)) {
        result.push(columnsObj[i - shift]); 
      } else {
        return columnsOrig;        
      }
    }  
    return result;   
  };

  // swap the colum of the table
  var columnSwapper = function (columns,nodeID) {
    var columnsObj = {};
    var result = [];
    var i;
    var clearColumnResult;
    var columnCleared = [];
    var config;
    
    if(TableComplexeEnhancedConfig.hasOwnProperty(nodeID) && TableComplexeEnhancedConfig[nodeID].hasOwnProperty("column")) {
      config = TableComplexeEnhancedConfig[nodeID].column;
      clearColumnResult = clearColumn(columns);
      columnsObj = reOrderColumn(clearColumnResult.columnCleared,config);
      result = reBuildColumn(columnsObj,config,clearColumnResult,columns);
      if(result === null) {
        return columns;
      } else {
        return result;
      }
    }
    return columns;    
  };


  // Apply ratio to the height
  var calcHeight = function (height,nodeID) {
    if(TableComplexeEnhancedConfig.hasOwnProperty(nodeID) && TableComplexeEnhancedConfig[nodeID].hasOwnProperty("heightPercent")) {
      return height/TableComplexeEnhancedConfig[nodeID].heightPercent;
    } else {
      return height;
    }

  };


  tableComplexeEnhanced.cwKendoGrid.setAnGetKendoGridData = function (dataSource) {
    this.columns = columnSwapper(this.columns,this.nodeSchema.NodeID);

    var kendoGridData = {
        dataSource: dataSource,
        dataBound: this.getDataBoundEvent(),
        dataBinding: this.customDataBinding.bind(this),
        resizable: true,
        editable: {
            mode: this.getEditableString(),
            confirmation: false,
            window: {
                title: $.i18n.prop('grid_popup_edit'),
            }
        },
        pageable: {
            refresh: false,
            pageSizes: TableComplexeEnhancedConfig.itemPerPages,
            buttonCount: 5
        },
        edit: this.editEvent.bind(this),
        scrollable: true,
        sortable: true,
        height: calcHeight(this.getHeight(),this.nodeSchema.NodeID), // changing height by factor
        remove: this.remove.bind(this),
        filterable: cwApi.cwKendoGridFilter.getFilterValues(),
        toolbar: cwApi.CwKendoGridToolBar.getToolBarItems(this.isAssociationgrid, this.enableAdd, this.canCreate, this.canCreateIntersection, this.properties.ObjectTypeScriptName, this.hasMandatoryAssociation, this.properties.Behaviour.Options, this.nodeSchema),
        columns: this.columns 
    };

    if(TableComplexeEnhancedConfig.title) {
      var obj = {
          name : 'Title',
          template : '<h3 style="right:50%; position:absolute">' + this.nodeSchema.NodeName + '</h3>'
      };
      kendoGridData.toolbar.unshift(obj);      
    }
    return kendoGridData;
  };



  tableComplexeEnhanced.cwKendoGridToolBar.getToolBarItems = function (isAssociation, isAddEnabled, canCreate, canCreateIntersection, objectTypeScriptName, hasMandatoryAssociation, gridOptions, nodeShema) {
    var toolBarObject, itemList;
    toolBarObject = new cwApi.CwKendoGridToolBar(isAssociation, isAddEnabled, canCreate, canCreateIntersection, objectTypeScriptName, hasMandatoryAssociation, gridOptions, nodeShema);
    itemList = [];

    if (cwApi.CwPrintManager.isPrintMode()) {
        return itemList;
    }

    toolBarObject.varifyAndAppendAddSearchButtons(itemList);
    toolBarObject.varifyAndAppendExportButton(itemList);
    toolBarObject.varifyAndAppendClearFilterButton(itemList);
    return itemList;
  };


  tableComplexeEnhanced.cwKendoGridToolBar.varifyAndAppendClearFilterButton = function (itemList) {
      //no export button on pop up inex page grid
      if (((this.pageViewType === "index" && !this.isAssociation) || this.pageViewType === cwApi.CwPageType.Single) && !cwApi.isIE9()) {
          itemList.push(this.getClearFilterButton());
      }
  };

  tableComplexeEnhanced.cwKendoGridToolBar.getClearFilterButton = function () {
      var clearFilterButton = {
          name: "clearFilter",
          template: '<a class="k-button k-button-icontext k-grid-clearFilter"><i class="fa fa-filter"></i>' + TableComplexeEnhancedConfig.clearButtonName + '</a>'
      };
      return clearFilterButton;
  };

  tableComplexeEnhanced.cwKendoGrid.setup = function (properties, allitems, isSearchEngineEnabled) {
    cwApi.CwPendingEventsManager.setEvent("GridSetup");
    var dataSource, gridObject, nodeSchema, mainItems, isIntersection, propertyGroupString, $container;


    if (cwApi.isNull(allitems)) {
        $container = $('div.' + properties.NodeID);
        cwApi.cwDisplayManager.setNoDataAvailableHtml($container);
        cwApi.CwPendingEventsManager.deleteEvent("GridSetup");
        return;
    }

    nodeSchema = cwApi.ViewSchemaManager.getNodeSchemaById(properties.PageName, properties.NodeID);
    isIntersection = properties.Behaviour.Options.is_intersection;
    propertyGroupString = "propertiesGroups";

    if (isIntersection) {
        propertyGroupString = "iPropertiesGroups";
        mainItems = allitems.associations[properties.NodeID];
        gridObject = createandGetIntersectionGrid(mainItems, properties, allitems, nodeSchema);
    } else if (properties.PageType === 1) {
        mainItems = allitems.associations[properties.NodeID];
        gridObject = createandGetIntersectionGrid(mainItems, properties, allitems, nodeSchema);
    } else {
        mainItems = allitems[properties.NodeID];
        gridObject = new cwBehaviours.CwKendoGrid(properties, allitems, nodeSchema);
    }

    gridObject.loadItemsByPageType(mainItems, properties.NodeID);

    if (!isIntersection) {
        propertyGroupString = "BOTH";
    }

    //if (gridObject.items.length > 0 && !isIntersection) {
    if (gridObject.items.length > 0) {
        //propertyGroupString = "BOTH";
        gridObject.loadHeader(propertyGroupString, nodeSchema, true);
    } else {
        nodeSchema.objectTypeScriptName = nodeSchema.ObjectTypeScriptName.toLowerCase();
        gridObject.loadHeaderForNoAssications(propertyGroupString, nodeSchema, true, properties.NodeID, isIntersection);
    }

    gridObject.isSearchEngineEnabled = isSearchEngineEnabled;
    dataSource = gridObject.loadData(propertyGroupString);

    kendo.culture(cwApi.cwConfigs.SelectedLanguage);
    cwApi.CwNumberSeparator.setupNumberSeperatorForKendoUi();

    gridObject.loadGrid(dataSource);

    this.enableClearFilter($container);

    dataSource._filter = cwApi.upgradedParseJSON(cwApi.CwLocalStorage.getGridFilterValues(properties.NodeID));
    dataSource.filter(dataSource._filter);

    cwApi.cwKendoGridFilter.addFilterTitle(gridObject.mainContainer);


    cwApi.CwPendingEventsManager.deleteEvent("GridSetup");

    if(TableComplexeEnhancedConfig.clearFilterAtStart) {this.ClearFilter();}

  };


  tableComplexeEnhanced.cwKendoGrid.enableClearFilter = function (container) {
    $('.k-grid-clearFilter').click(this.ClearFilter);
  };

  tableComplexeEnhanced.cwKendoGrid.ClearFilter = function () {
    $("a.k-state-active").trigger("click");
    $(" form.k-filter-menu button[type='reset']").trigger("click");
  };



  if(cwBehaviours && cwBehaviours.hasOwnProperty('CwKendoGrid') && cwBehaviours.CwKendoGrid.prototype.setAnGetKendoGridData) {
    cwBehaviours.CwKendoGrid.prototype.setAnGetKendoGridData = tableComplexeEnhanced.cwKendoGrid.setAnGetKendoGridData;
    cwBehaviours.CwKendoGrid.enableClearFilter = tableComplexeEnhanced.cwKendoGrid.enableClearFilter;
    cwBehaviours.CwKendoGrid.ClearFilter = tableComplexeEnhanced.cwKendoGrid.ClearFilter;
    cwBehaviours.CwKendoGrid.setup = tableComplexeEnhanced.cwKendoGrid.setup;
  }

  if(cwAPI.hasOwnProperty('CwKendoGridToolBar') && cwAPI.CwKendoGridToolBar) {
    cwAPI.CwKendoGridToolBar.getToolBarItems = tableComplexeEnhanced.cwKendoGridToolBar.getToolBarItems;    
    cwAPI.CwKendoGridToolBar.prototype.varifyAndAppendClearFilterButton = tableComplexeEnhanced.cwKendoGridToolBar.varifyAndAppendClearFilterButton;
    cwAPI.CwKendoGridToolBar.prototype.getClearFilterButton = tableComplexeEnhanced.cwKendoGridToolBar.getClearFilterButton;
  }



}(cwAPI, jQuery));