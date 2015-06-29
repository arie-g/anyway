var INACCURATE_MARKER_OPACITY = 0.5;

var MarkerView = Backbone.View.extend({
    events : {
        "click .delete-button" : "clickDelete"
    },
    initialize : function(options) {
        this.map = options.map;
        _.bindAll(this, "clickMarker");
    },
    localize : function(field,value) {
        //localizes non-mandatory data (which has the same consistent html and python field names)
            if (this.model.has(value) && this.model.get(value)!="" &&
                    localization[field][this.model.get(value)]!=undefined) {
                this.$el.find("." + value).text(fields[field] + ": " + localization[field][this.model.get(value)]);
        }
    },
    localize_inv : function(field,value) {
        // localizes involved data
            if (this.model.has(value) && this.model.get(value)!="" &&
                    inv_dict[field][this.model.get(value)]!=undefined) {
                this.$el.find("." + value).text(fields[field] + ": " + inv_dict[field][this.model.get(value)]);
        }
    },
    localize_veh : function(field,value) {
        // localizes vehicles data
            if (this.model.has(value) && this.model.get(value)!="" &&
                    veh_dict[field][this.model.get(value)]!=undefined) {
                this.$el.find("." + value).text(fields[field] + ": " + veh_dict[field][this.model.get(value)]);
        }
    },
    localize_num : function(field,value) {
        // localizes interger data values
            if (this.model.has(value) && this.model.get(value)!="" &&
                    fields[field]!=undefined) {
                this.$el.find("." + value).text(fields[field] + ": " + this.model.get(value));
        }
    },

    render : function() {

        var markerPosition = new google.maps.LatLng(this.model.get("latitude"),
                                                    this.model.get("longitude"));

        this.marker = new google.maps.Marker({
            position: markerPosition,
            id: this.model.get("id")
        });

        if (this.model.get("type") == MARKER_TYPE_DISCUSSION) {
            if (isRetina){
                this.marker.setIcon({url: DISCUSSION_ICON, scaledSize: new google.maps.Size(30, 50)});
            } else {
                this.marker.setIcon(DISCUSSION_ICON);
            }
            this.marker.setTitle("דיון"); //this.model.get("title"));
            this.marker.setMap(this.map);
            this.marker.view = this;
            google.maps.event.addListener(this.marker, "click",
                _.bind(app.showDiscussion, app, this.model.get("identifier")) );
            return this;
        }

        //app.clusterer.addMarker(this.marker);
        if (app.map.zoom < MINIMAL_ZOOM) {
            return this;
        }

        this.marker.setOpacity(this.model.get("locationAccuracy") == 1 ? 1.0 : INACCURATE_MARKER_OPACITY);
        this.marker.setIcon(this.getIcon());
        this.marker.setTitle(this.getTitle());
        this.marker.setMap(this.map);
        this.marker.view = this;

        app.oms.addMarker(this.marker);

        this.$el.html($("#marker-content-template").html());

        this.$el.width(400);
        this.$el.find(".title").text(localization.SUG_TEUNA[this.model.get("subtype")]);
        this.$el.find(".roadType").text(fields.SUG_DEREH + ": " + localization.SUG_DEREH[this.model.get("roadType")]);
        this.$el.find(".accidentType").text(fields.SUG_TEUNA+ ": " + localization.SUG_TEUNA[this.model.get("subtype")]);
        this.$el.find(".roadShape").text(fields.ZURAT_DEREH+ ": " + localization.ZURAT_DEREH[this.model.get("roadShape")]);
        this.$el.find(".severityText").text(fields.HUMRAT_TEUNA + ": " + localization.HUMRAT_TEUNA[this.model.get("severity")]);
        this.$el.find(".dayType").text(fields.SUG_YOM + ": " + localization.SUG_YOM[this.model.get("dayType")]);
        this.$el.find(".igun").text(fields.STATUS_IGUN + ": " + localization.STATUS_IGUN[this.model.get("locationAccuracy")]);
        this.$el.find(".unit").text(fields.YEHIDA + ": " + localization.YEHIDA[this.model.get("unit")]);
        this.$el.find(".mainStreet").text(this.model.get("mainStreet"));
        this.$el.find(".secondaryStreet").text(this.model.get("secondaryStreet"));
        this.$el.find(".junction").text(this.model.get("junction"));
        // Non-mandatory fields:
        this.localize("HAD_MASLUL","one_lane");
        this.localize("RAV_MASLUL","multi_lane");
        this.localize("MEHIRUT_MUTERET","speed_limit");
        this.localize("TKINUT","intactness");
        this.localize("ROHAV","road_width");
        this.localize("SIMUN_TIMRUR","road_sign");
        this.localize("TEURA","road_light");
        this.localize("BAKARA","road_control");
        this.localize("MEZEG_AVIR","weather");
        this.localize("PNE_KVISH","road_surface");
        this.localize("SUG_EZEM","road_object");
        this.localize("MERHAK_EZEM","object_distance");
        this.localize("LO_HAZA","didnt_cross");
        this.localize("OFEN_HAZIYA","cross_mode");
        this.localize("MEKOM_HAZIYA","cross_location");
        this.localize("KIVUN_HAZIYA","cross_direction");
        // Involved fields: TODO: add AJAX calls to get dictionary required fields (INVOLVED + VEHICLES)
        this.localize_inv("SUG_MEORAV","involved_type");
        this.localize_num("SHNAT_HOZAA","license_aquiring_date");
        this.localize_num("KVUZA_GIL","age_group");                   // Dictionary.csv - Table 92
        this.localize_inv("MIN","sex");
        this.localize_inv("SUG_REHEV_NASA_LMS","car_type");
        this.localize_inv("EMZAE_BETIHUT","safety_measures");
        this.localize_num("SEMEL_YISHUV_MEGURIM","home_city");        // Cities.csv - "SEMEL"
        this.localize_inv("HUMRAT_PGIA","injured_severity");
        this.localize_inv("SUG_NIFGA_LMS","injured_type");
        this.localize_inv("PEULAT_NIFGA_LMS","injured_position");
        this.localize_num("KVUTZAT_OHLUSIYA_LMS","population_type");  // Dictionary.csv - Table 66
        // Vehicles fields:
        this.localize_num("NEFAH","engine_volume");                   // Dictionary.csv - Table 111
        this.localize_num("SHNAT_YITZUR","manufacturing_year");
        this.localize_num("KIVUNE_NESIA","driving_directions");       // Dictionary.csv - Table 28
        this.localize_veh("MATZAV_REHEV","vehicle_status");
        this.localize_veh("SHIYUH_REHEV_LMS","vehicle_attribution");
        this.localize_veh("SUG_REHEV_LMS","vehicle_type");
        this.localize_num("MEKOMOT_YESHIVA_LMS","seats");             // Dictionary.csv - Table 112
        this.localize_num("MISHKAL_KOLEL_LMS","total_weight");


        this.$el.find(".creation-date").text("תאריך: " +
                    moment(this.model.get("created")).format("LLLL"));
        this.$el.find(".profile-image").attr("src", "/static/img/lamas.png");
        this.$el.find(".profile-image").attr("width", "50px");
        display_user = 'הלשכה המרכזית לסטטיסטיקה';
        this.$el.find(".added-by").text("מקור: " + display_user);


        return this;
    },
    getIcon : function() {
        return getIcon(this.model.get("subtype"), this.model.get("severity"));
    },
    getTitle : function() {
        return moment(this.model.get("created")).format("l")
        + " תאונה " + SEVERITY_MAP[this.model.get("severity")]
        + ": " + SUBTYPE_STRING[this.model.get("subtype")];
    },
    choose : function() {
        if (app.oms.markersNearMarker(this.marker).length) {
            new google.maps.event.trigger(this.marker, "click");
        }
        new google.maps.event.trigger(this.marker, "click");
    },
    getUrl: function () {
        var dateRange = app.model.get("dateRange");
        var center = app.map.getCenter();
        return "/?marker=" + this.model.get("id") + "&" + app.getCurrentUrlParams();
    },
    clickMarker : function() {
        $.get("/markers/" + this.model.get("id"), function (data) {
            //alert(data);
        });
        this.highlight();
        app.closeInfoWindow();

        app.selectedMarker = this;
        app.infoWindow = new google.maps.InfoWindow({
            content: this.el
        });

        app.infoWindow.open(this.map, this.marker);
        app.updateUrl(this.getUrl());

        $(document).keydown(app.ESCinfoWindow);

    },
    highlight : function() {
        if (app.oms.markersNearMarker(this.marker, true)[0]  && !this.model.get("currentlySpiderfied")){
            this.resetOpacitySeverity();
        }
        this.marker.setAnimation(google.maps.Animation.BOUNCE);


        // ##############################
        // # Another option, if we don't want the somewhat unintuitive experience where an icon start's bouncing,
        // # but other icons in the same place stay still, will be to do like so: (option 2)
        // ##############################

        // _.each(app.oms.markersNearMarker(this.marker), function (marker){

        //     marker.setAnimation(google.maps.Animation.BOUNCE);

        // });
        // this.marker.setAnimation(google.maps.Animation.BOUNCE);

        // ## END (option 2)

    },
    unhighlight : function() {
        if (app.oms.markersNearMarker(this.marker, true)[0] && !this.model.get("currentlySpiderfied")){
            this.opacitySeverityForGroup();
        }
        this.marker.setAnimation(null);


        // ##############################
        // # Option 2
        // ##############################

        // _.each(app.oms.markersNearMarker(this.marker), function (marker){

        //     marker.setAnimation(null);

        // });
        // this.marker.setAnimation(null);

        // ## END (option 2)

    },
    clickShare : function() {
        FB.ui({
            method: "feed",
            name: this.model.get("title"),
            link: document.location.href,
            description: this.model.get("description"),
            caption: SUBTYPE_STRING[this.model.get("subtype")]
            // picture
        });
    },
    resetOpacitySeverity : function() {
        this.marker.icon = this.getIcon();
        this.marker.opacity = this.model.get("locationAccuracy") == 1 ? 1.0 : INACCURATE_MARKER_OPACITY;
    },
    opacitySeverityForGroup : function() {
        var group = this.model.get("groupID") -1;
        if (isRetina){
            this.marker.icon = { url: MULTIPLE_ICONS[app.groupsData[group].severity], scaledSize: new google.maps.Size(30, 50) };
        } else {
            this.marker.icon = MULTIPLE_ICONS[app.groupsData[group].severity];
        }
        if (app.groupsData[group].opacity != 'opaque'){
            this.marker.opacity = INACCURATE_MARKER_OPACITY / app.groupsData[group].opacity;
        }
    }
});
