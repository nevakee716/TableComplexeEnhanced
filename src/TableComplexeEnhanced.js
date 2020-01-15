/*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  "use strict";

  var tableComplexeEnhanced = {};
  tableComplexeEnhanced.cwKendoGrid = {};
  tableComplexeEnhanced.cwKendoGridToolBar = {};
  tableComplexeEnhanced.cwKendoGridData = {};

  var TableComplexeEnhancedConfig = {
    itemPerPages: [5, 12, 42, 9999],
    title: true,
    urlText: "Cliquez Ici",
    openInNewTab: true,
    clearFilterAtStart: true,
    clearButtonName: "Clear All Filters",
    popOut: true,
    organisation_1994355017: {
      // nodeID
      heightPercent: 2, // TableSize = size of the window / heightPercent
      popOutName: "",
    },
    processus_1542613035: {
      // nodeID
      heightPercent: 2, // TableSize = size of the window / heightPercent
    },
    flux_20005_667676674: {
      heightPercent: 2, // TableSize = size of the window / heightPercent
    },
    flux_20006_2055139330: {
      heightPercent: 2, // TableSize = size of the window / heightPercent
    },
    application_grid: {
      heightPercent: 1,
      column: {
        5: {
          name: "toto",
        },
      },
    },
    transformation_457481980j: {
      popOutName: "transformation2_diagram_popout",
    },
  };

  var kendoGridDataSaved = {};

  // remove the special column of the table complexe and replace after the switch
  var clearColumn = function(columns) {
    var columnCleared = [];

    var result = {
      iUpdate: undefined,
      iCreate: undefined,
      columnCleared: columnCleared,
    };

    for (i = 0; i < columns.length; i++) {
      if (columns[i].title === "CanCreate" && columns[i].field === "type_id_cancreate") {
        result.Create = i;
      } else if (columns[i].title === "CanUpdate" && columns[i].field === "type_id_canupdate") {
        result.Update = i;
      } else if (columns[i].title === "Options" && columns[i].field === undefined) {
        result.Options = i;
      } else if (columns[i].title === "ID" && columns[i].field === "id") {
        result.ID = i;
      } else {
        columnCleared.push(columns[i]);
      }
    }
    return result;
  };

  var reOrderColumn = function(columns, config) {
    var columnsObj = {};
    var i;
    for (i = 0; i < columns.length; i++) {
      if (config.hasOwnProperty(i + 1)) {
        if (config[i + 1].size) columns[i].width = config[i + 1].size; // gestion size
        if (config[i + 1].name) columns[i].title = config[i + 1].name; // gestion rename
        if (config[i + 1].order) columnsObj[config[i + 1].order - 1] = columns[i]; // custom order
      } else {
        columnsObj[i] = columns[i];
      }
    }
    return columnsObj;
  };

  var reBuildColumn = function(columnsObj, config, iObject, columnsOrig) {
    var result = [];
    var shift = 0;

    for (i = 0; i < columnsOrig.length; i++) {
      if (i === iObject.Update || i === iObject.Create || i === iObject.Options || i === iObject.ID) {
        result.push(columnsOrig[i]);
        shift = shift + 1;
      } else if (columnsObj.hasOwnProperty(i - shift)) {
        result.push(columnsObj[i - shift]);
      } else {
        return columnsOrig;
      }
    }
    return result;
  };

  // swap the colum of the table
  var columnSwapper = function(columns, nodeID) {
    var columnsObj = {};
    var result = [];
    var i;
    var clearColumnResult;
    var columnCleared = [];
    var config;

    if (TableComplexeEnhancedConfig.popOut) {
      if (columns[0].title == "Options") columns[0].width += 35;
      if (columns[columns.length - 1].title == "Options") columns[columns.length - 1].width += 35;
    }
    if (TableComplexeEnhancedConfig.hasOwnProperty(nodeID) && TableComplexeEnhancedConfig[nodeID].hasOwnProperty("column")) {
      config = TableComplexeEnhancedConfig[nodeID].column;
      clearColumnResult = clearColumn(columns);
      columnsObj = reOrderColumn(clearColumnResult.columnCleared, config);
      result = reBuildColumn(columnsObj, config, clearColumnResult, columns);
      if (result === null) {
        return columns;
      } else {
        return result;
      }
    }
    return columns;
  };

  // Apply ratio to the height
  var calcHeight = function(height, nodeID) {
    if (TableComplexeEnhancedConfig.hasOwnProperty(nodeID) && TableComplexeEnhancedConfig[nodeID].hasOwnProperty("heightPercent")) {
      return height / TableComplexeEnhancedConfig[nodeID].heightPercent;
    } else {
      return height;
    }
  };

  tableComplexeEnhanced.cwKendoGrid.setAnGetKendoGridData = function(dataSource) {
    this.columns = columnSwapper(this.columns, this.nodeSchema.NodeID);

    var kendoGridData = {
      dataSource: dataSource,
      dataBound: this.getDataBoundEvent(),
      dataBinding: this.customDataBinding.bind(this),
      resizable: true,
      editable: {
        mode: this.getEditableString(),
        confirmation: false,
        window: {
          title: $.i18n.prop("grid_popup_edit"),
        },
      },
      pageable: {
        refresh: false,
        pageSizes: TableComplexeEnhancedConfig.itemPerPages,
        buttonCount: 5,
      },
      page: tableComplexeEnhanced.cwKendoGrid.enablePopoutButton,
      filter: tableComplexeEnhanced.cwKendoGrid.enablePopoutButton,
      edit: this.editEvent.bind(this),
      scrollable: true,
      sortable: true,
      height: calcHeight(this.getHeight(), this.nodeSchema.NodeID), // changing height by factor
      remove: this.remove.bind(this),
      filterable: cwApi.cwKendoGridFilter.getFilterValues(),
      toolbar: cwApi.CwKendoGridToolBar.getToolBarItems(this.isAssociationgrid, this.enableAdd, this.canCreate, this.canCreateIntersection, this.properties.ObjectTypeScriptName, this.hasMandatoryAssociation, this.properties.Behaviour.Options, this.nodeSchema),
      columns: this.columns,
    };

    if (TableComplexeEnhancedConfig.title) {
      var obj = {
        name: "Title",
        template: '<h3 style="right:50%; position:absolute">' + this.nodeSchema.NodeName + "</h3>",
      };
      kendoGridData.toolbar.unshift(obj);
    }
    kendoGridDataSaved = kendoGridData;
    return kendoGridData;
  };

  tableComplexeEnhanced.cwKendoGridToolBar.getToolBarItems = function(isAssociation, isAddEnabled, canCreate, canCreateIntersection, objectTypeScriptName, hasMandatoryAssociation, gridOptions, nodeShema) {
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

  tableComplexeEnhanced.cwKendoGridToolBar.varifyAndAppendClearFilterButton = function(itemList) {
    //no export button on pop up inex page grid
    if (((this.pageViewType === "index" && !this.isAssociation) || this.pageViewType === cwApi.CwPageType.Single) && !cwApi.isIE9()) {
      itemList.push(this.getClearFilterButton());
    }
  };

  tableComplexeEnhanced.cwKendoGridToolBar.getClearFilterButton = function() {
    var clearFilterButton = {
      name: "clearFilter",
      template: '<a class="k-button k-button-icontext k-grid-clearFilter"><i class="fa fa-filter"></i>' + TableComplexeEnhancedConfig.clearButtonName + "</a>",
    };
    return clearFilterButton;
  };

  tableComplexeEnhanced.cwKendoGrid.setup = function(properties, allitems, isSearchEngineEnabled) {
    cwApi.CwPendingEventsManager.setEvent("GridSetup");
    var dataSource, gridObject, nodeSchema, mainItems, isIntersection, propertyGroupString, $container;

    function createandGetIntersectionGrid(mainItems, properties, allitems, nodeSchema) {
      var mainItemsWithKey, gridObject, iObjectTypeScriptName;
      mainItemsWithKey = {};
      mainItemsWithKey[properties.NodeID] = mainItems;
      iObjectTypeScriptName = nodeSchema.iObjectTypeScriptName;
      if (iObjectTypeScriptName !== null) {
        iObjectTypeScriptName = iObjectTypeScriptName.toLowerCase();
      }
      gridObject = new cwBehaviours.CwKendoGridIntersectionObject(properties, mainItemsWithKey, allitems, iObjectTypeScriptName, nodeSchema.ObjectTypeScriptName.toLowerCase(), nodeSchema, nodeSchema.AssociationTypeScriptName.toLowerCase());
      return gridObject;
    }

    if (cwApi.isNull(allitems)) {
      $container = $("div." + properties.NodeID);
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

    this.enablePopoutButton($container);

    if (TableComplexeEnhancedConfig.clearFilterAtStart) {
      this.ClearFilter();
    }
  };

  tableComplexeEnhanced.cwKendoGrid.enableClearFilter = function(container) {
    $(".k-grid-clearFilter").click(this.ClearFilter);
  };

  tableComplexeEnhanced.cwKendoGrid.ClearFilter = function() {
    $("a.k-state-active").trigger("click");
    $(" form.k-filter-menu button[type='reset']").trigger("click");
  };

  tableComplexeEnhanced.cwKendoGrid.enablePopoutButton = function(container) {
    $(".k-grid-popoutitem").off("click");
    setTimeout(function() {
      $(".k-grid-popoutitem").on("click", tableComplexeEnhanced.cwKendoGrid.openPopOut);
    }, 500);
  };

  tableComplexeEnhanced.cwKendoGrid.openPopOut = function(e) {
    var data_popout,
      obj = {};
    if (e.target.hasAttribute("data_id")) {
      obj.object_id = e.target.getAttribute("data_id");
      data_popout = e.target.getAttribute("data_popout");
    }
    if (e.target.parentElement.hasAttribute("data_id")) {
      obj.object_id = e.target.parentElement.getAttribute("data_id");
      data_popout = e.target.parentElement.getAttribute("data_popout");
    }

    cwAPI.cwDiagramPopoutHelper.openDiagramPopout(obj, data_popout);
  };

  //Vrai Faux
  cwBehaviours.CwKendoGridBooleanType.prototype.getColumnTemplate = function() {
    return "#= data." + this.property.scriptName + " ? '" + '<i style="color:green" class="fa fa-check" aria-hidden="true"></i>' + "' : '" + '<i style="color:red" class="fa fa-times" aria-hidden="true"></i>' + "' #";
  };

  cwAPI.cwPropertiesGroups.types.booleanValue = function(value) {
    if (value !== false) {
      value = '<i style="color:green" class="fa fa-check"><span class="hidden">' + jQuery.i18n.prop("global_true") + "</span></i>";
    } else {
      value = '<i style="color:red" class="fa fa-times"><span class="hidden">' + jQuery.i18n.prop("global_false") + "</span></i>";
    }
    return value;
  };

  //Url
  cwApi.cwPropertiesGroups.types.URLValue = function(value) {
    var txt = "",
      link = value;
    if (TableComplexeEnhancedConfig.openInNewTab) txt = 'target="_blank"';
    value = TableComplexeEnhancedConfig.urlText + " <a " + txt + 'href="' + link + '">' + '<div style="display:none">' + link + "</div>" + "<i class='fa fa-file-text' </i>" + "</a>";
    return value;
  };

  // popout button
  tableComplexeEnhanced.cwKendoGridData.editTemplate = function(e) {
    var output = [];
    var popOutName,
      self = this;

    function getEditColumnTemplate(isHidden, addEdit, addDelete, addRemove, isAssociation) {
      output.push(cwApi.cwKendoGridButtons.getActionZoneDiv(isHidden));
      if (isOpenButtonAvailable(isAssociation)) {
        output.push(cwApi.cwKendoGridButtons.getOpenButton());
      }
      if (addEdit) {
        output.push(cwApi.cwKendoGridButtons.getEdiButton());
      }
      if (addRemove) {
        output.push(cwApi.cwKendoGridButtons.getRemoveButton());
      }
      if (addDelete) {
        output.push(cwApi.cwKendoGridButtons.getDeleteButton());
      }
      if (TableComplexeEnhancedConfig.popOut && e.item && e.item.nodeID) {
        if (TableComplexeEnhancedConfig.hasOwnProperty(e.item.nodeID) && TableComplexeEnhancedConfig[e.item.nodeID].popOutName) popOutName = cwApi.replaceSpecialCharacters(TableComplexeEnhancedConfig[e.item.nodeID].popOutName);
        else {
          popOutName = cwApi.replaceSpecialCharacters(e.item.objectTypeScriptName) + "_diagram_popout";
        }
        if (cwAPI.ViewSchemaManager.pageExists(popOutName) === true) {
          output.push(tableComplexeEnhanced.getPopOutButton(e, popOutName));
        }
      }

      output.push(cwApi.cwKendoGridButtons.getCloseDiv());
      return output.join("");
    }

    function isOpenButtonAvailable(isAssociation) {
      if (isAssociation) {
        return cwApi.getQueryStringObject().cwtype === cwApi.CwPageType.Single;
      }
      return true;
    }

    function isUserCanUpdate(e) {
      return e.enableEdit && ((e.canUpdate && !cwApi.cwUser.isCurrentUserSocial()) || cwApi.isUndefined(e.canUpdate));
    }

    function isUserCanDelete(e) {
      return e.enableDelete && ((e.canDelete && !cwApi.cwUser.isCurrentUserSocial()) || cwApi.isUndefined(e.canDelete));
    }

    function isUserCanRemoveAssociation(e, isAssociation) {
      if (isAssociation) {
        return e.enableUnlink && !cwApi.cwUser.isCurrentUserSocial() && (e.canCreateIntersection || cwApi.isUndefined(e.canCreateIntersection));
      }
      return false;
    }

    if ($(".form-edit").length > 0) {
      return getEditColumnTemplate(true, isUserCanUpdate(e), isUserCanDelete(e), isUserCanRemoveAssociation(e, this.isAssociationgrid), this.isAssociationgrid);
    }

    if (cwApi.isLive()) {
      return getEditColumnTemplate(false, isUserCanUpdate(e), isUserCanDelete(e), isUserCanRemoveAssociation(e, this.isAssociationgrid), this.isAssociationgrid);
    }
    return getEditColumnTemplate(false, false, false, false, this.isAssociationgrid);
  };

  tableComplexeEnhanced.getPopOutButton = function(e, popOutName) {
    var output = "";
    output = '<a class="k-button k-button-icontext k-grid-popoutitem" data_id=' + e.item.object_id + ' data_popout="' + popOutName + '"><i class="fa fa-external-link"></i>' + "</a>";
    return output;
  };

  if (cwBehaviours.hasOwnProperty("CwKendoGrid") && cwBehaviours.CwKendoGrid.prototype.setAnGetKendoGridData) {
    cwBehaviours.CwKendoGrid.prototype.setAnGetKendoGridData = tableComplexeEnhanced.cwKendoGrid.setAnGetKendoGridData;
    cwBehaviours.CwKendoGrid.enableClearFilter = tableComplexeEnhanced.cwKendoGrid.enableClearFilter;
    cwBehaviours.CwKendoGrid.ClearFilter = tableComplexeEnhanced.cwKendoGrid.ClearFilter;
    cwBehaviours.CwKendoGrid.enablePopoutButton = tableComplexeEnhanced.cwKendoGrid.enablePopoutButton;
    cwBehaviours.CwKendoGrid.openPopOut = tableComplexeEnhanced.cwKendoGrid.openPopOut;
    cwBehaviours.CwKendoGrid.setup = tableComplexeEnhanced.cwKendoGrid.setup;
  }

  if (cwAPI.CwKendoGridToolBar) {
    cwAPI.CwKendoGridToolBar.getToolBarItems = tableComplexeEnhanced.cwKendoGridToolBar.getToolBarItems;
    cwAPI.CwKendoGridToolBar.prototype.varifyAndAppendClearFilterButton = tableComplexeEnhanced.cwKendoGridToolBar.varifyAndAppendClearFilterButton;
    cwAPI.CwKendoGridToolBar.prototype.getClearFilterButton = tableComplexeEnhanced.cwKendoGridToolBar.getClearFilterButton;
  }

  if (cwBehaviours.CwKendoGridData) {
    cwBehaviours.CwKendoGridData.prototype.editTemplate = tableComplexeEnhanced.cwKendoGridData.editTemplate;
  }
})(cwAPI, jQuery);
