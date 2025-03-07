import {
  BoundingSphere,
  Cartesian3,
  CartographicGeocoderService,
  CesiumWidget,
  Clock,
  ClockRange,
  ClockStep,
  Color,
  CreditDisplay,
  defined,
  EllipsoidTerrainProvider,
  HeadingPitchRange,
  JulianDate,
  Matrix4,
  Rectangle,
  TimeIntervalCollection,
  WebMercatorProjection,
  ConstantPositionProperty,
  ConstantProperty,
  DataSourceClock,
  DataSourceCollection,
  DataSourceDisplay,
  Entity,
  Camera,
  CameraFlightPath,
  Cesium3DTileset,
  ImageryLayer,
  ImageryLayerCollection,
  Cesium3DTilesVoxelProvider,
  SceneMode,
  ShadowMode,
  TimeDynamicPointCloud,
  VoxelPrimitive,
} from "@cesium/engine";

import {
  Animation,
  BaseLayerPicker,
  ProviderViewModel,
  ClockViewModel,
  FullscreenButton,
  Geocoder,
  HomeButton,
  NavigationHelpButton,
  SceneModePicker,
  SelectionIndicator,
  Timeline,
} from "../../index.js";

import createViewer from "../createViewer.js";
import DomEventSimulator from "../../../../Specs/DomEventSimulator.js";
import MockDataSource from "../../../../Specs/MockDataSource.js";
import pollToPromise from "../../../../Specs/pollToPromise.js";

describe(
  "Widgets/Viewer/Viewer",
  function () {
    const testProvider = {
      tilingScheme: {
        tileXYToRectangle: function () {
          return new Rectangle();
        },
      },
      rectangle: Rectangle.MAX_VALUE,
    };

    const testProviderViewModel = new ProviderViewModel({
      name: "name",
      tooltip: "tooltip",
      iconUrl: "url",
      creationFunction: function () {
        return testProvider;
      },
    });

    let container;
    let viewer;
    beforeEach(function () {
      container = document.createElement("div");
      container.id = "container";
      container.style.width = "1px";
      container.style.height = "1px";
      container.style.overflow = "hidden";
      container.style.position = "relative";
      document.body.appendChild(container);
    });

    afterEach(function () {
      if (viewer && !viewer.isDestroyed()) {
        viewer = viewer.destroy();
      }

      document.body.removeChild(container);
    });

    it("constructor sets default values", function () {
      viewer = createViewer(container);
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.clockViewModel).toBeInstanceOf(ClockViewModel);
      expect(viewer.animation.viewModel.clockViewModel).toBe(
        viewer.clockViewModel
      );
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      expect(viewer.imageryLayers).toBeInstanceOf(ImageryLayerCollection);
      expect(viewer.terrainProvider).toBeInstanceOf(EllipsoidTerrainProvider);
      expect(viewer.creditDisplay).toBeInstanceOf(CreditDisplay);
      expect(viewer.camera).toBeInstanceOf(Camera);
      expect(viewer.dataSourceDisplay).toBeInstanceOf(DataSourceDisplay);
      expect(viewer.dataSources).toBeInstanceOf(DataSourceCollection);
      expect(viewer.canvas).toBe(viewer.cesiumWidget.canvas);
      expect(viewer.cesiumLogo).toBe(viewer.cesiumWidget.cesiumLogo);
      expect(viewer.screenSpaceEventHandler).toBe(
        viewer.cesiumWidget.screenSpaceEventHandler
      );
      expect(viewer.useBrowserRecommendedResolution).toBe(true);
      expect(viewer.isDestroyed()).toEqual(false);
      viewer.destroy();
      expect(viewer.isDestroyed()).toEqual(true);
    });

    it("can specify custom clockViewModel", function () {
      const clockViewModel = new ClockViewModel();
      viewer = createViewer(container, { clockViewModel: clockViewModel });
      expect(viewer.clockViewModel).toBe(clockViewModel);
      expect(viewer.animation.viewModel.clockViewModel).toBe(
        viewer.clockViewModel
      );
      viewer.destroy();
      expect(clockViewModel.isDestroyed()).toBe(false);
      clockViewModel.destroy();
    });

    it("can set shouldAnimate", function () {
      viewer = createViewer(container, {
        shouldAnimate: true,
      });
      expect(viewer.clock.shouldAnimate).toBe(true);
    });

    it("setting shouldAnimate in options overrides clock shouldAnimate", function () {
      const clockViewModel = new ClockViewModel(
        new Clock({
          shouldAnimate: false,
        })
      );

      viewer = createViewer(container, {
        clockViewModel: clockViewModel,
        shouldAnimate: true,
      });

      expect(viewer.clock.shouldAnimate).toBe(true);
    });

    it("renders without errors", function () {
      viewer = createViewer(container);
      spyOn(viewer.scene.renderError, "raiseEvent");
      viewer.render();
      expect(viewer.scene.renderError.raiseEvent).not.toHaveBeenCalled();
    });

    it("constructor works with container id string", function () {
      viewer = createViewer("container");
      expect(viewer.container).toBe(container);
    });

    it("can shut off HomeButton", function () {
      viewer = createViewer(container, {
        homeButton: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeUndefined();
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off SceneModePicker", function () {
      viewer = createViewer(container, {
        sceneModePicker: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeUndefined();
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off BaseLayerPicker", function () {
      viewer = createViewer(container, {
        baseLayerPicker: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeUndefined();
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off NavigationHelpButton", function () {
      viewer = createViewer(container, {
        navigationHelpButton: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeUndefined();
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off Animation", function () {
      viewer = createViewer(container, {
        animation: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeUndefined();
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off Timeline", function () {
      viewer = createViewer(container, {
        timeline: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeUndefined();
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off FullscreenButton", function () {
      viewer = createViewer(container, {
        fullscreenButton: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeUndefined();
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off FullscreenButton and Timeline", function () {
      viewer = createViewer(container, {
        timeline: false,
        fullscreenButton: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeUndefined();
      expect(viewer.fullscreenButton).toBeUndefined();
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off FullscreenButton, Timeline, and Animation", function () {
      viewer = createViewer(container, {
        timeline: false,
        fullscreenButton: false,
        animation: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeUndefined(Animation);
      expect(viewer.timeline).toBeUndefined();
      expect(viewer.fullscreenButton).toBeUndefined();
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("can shut off Geocoder", function () {
      viewer = createViewer(container, {
        geocoder: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeUndefined();
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeInstanceOf(SelectionIndicator);
      viewer.resize();
      viewer.render();
    });

    it("constructs geocoder", function () {
      viewer = createViewer(container, {
        geocoder: true,
      });
      expect(viewer.geocoder).toBeDefined();
      expect(viewer.geocoder.viewModel._geocoderServices.length).toBe(2);
    });

    it("constructs geocoder with geocoder service option", function () {
      const service = new CartographicGeocoderService();
      viewer = createViewer(container, {
        geocoder: service,
      });
      expect(viewer.geocoder).toBeDefined();
      expect(viewer.geocoder.viewModel._geocoderServices.length).toBe(1);
      expect(viewer.geocoder.viewModel._geocoderServices[0]).toBe(service);
    });

    it("constructs geocoder with geocoder service options", function () {
      const service = new CartographicGeocoderService();
      viewer = createViewer(container, {
        geocoder: [service],
      });
      expect(viewer.geocoder).toBeDefined();
      expect(viewer.geocoder.viewModel._geocoderServices.length).toBe(1);
      expect(viewer.geocoder.viewModel._geocoderServices[0]).toBe(service);
    });

    it("can shut off SelectionIndicator", function () {
      viewer = createViewer(container, {
        selectionIndicator: false,
      });
      expect(viewer.container).toBe(container);
      expect(viewer.cesiumWidget).toBeInstanceOf(CesiumWidget);
      expect(viewer.geocoder).toBeInstanceOf(Geocoder);
      expect(viewer.homeButton).toBeInstanceOf(HomeButton);
      expect(viewer.sceneModePicker).toBeInstanceOf(SceneModePicker);
      expect(viewer.baseLayerPicker).toBeInstanceOf(BaseLayerPicker);
      expect(viewer.navigationHelpButton).toBeInstanceOf(NavigationHelpButton);
      expect(viewer.animation).toBeInstanceOf(Animation);
      expect(viewer.timeline).toBeInstanceOf(Timeline);
      expect(viewer.fullscreenButton).toBeInstanceOf(FullscreenButton);
      expect(viewer.selectionIndicator).toBeUndefined();
      viewer.resize();
      viewer.render();
    });

    it("can set shadows", function () {
      viewer = createViewer(container, {
        shadows: true,
      });
      expect(viewer.shadows).toBe(true);
    });

    it("can set terrain shadows", function () {
      viewer = createViewer(container, {
        terrainShadows: ShadowMode.ENABLED,
      });
      expect(viewer.terrainShadows).toBe(ShadowMode.ENABLED);
    });

    it("can set terrainProvider", function () {
      const provider = new EllipsoidTerrainProvider();

      viewer = createViewer(container, {
        baseLayerPicker: false,
        terrainProvider: provider,
      });
      expect(viewer.scene.terrainProvider).toBe(provider);

      const anotherProvider = new EllipsoidTerrainProvider();
      viewer.terrainProvider = anotherProvider;
      expect(viewer.terrainProvider).toBe(anotherProvider);
    });

    it("can set fullScreenElement", function () {
      const testElement = document.createElement("span");

      viewer = createViewer(container, {
        fullscreenElement: testElement,
      });
      expect(viewer.fullscreenButton.viewModel.fullscreenElement).toBe(
        testElement
      );
    });

    it("can set contextOptions", function () {
      const webglOptions = {
        alpha: true,
        depth: true, //TODO Change to false when https://bugzilla.mozilla.org/show_bug.cgi?id=745912 is fixed.
        stencil: true,
        antialias: false,
        powerPreference: "low-power",
        premultipliedAlpha: true, // Workaround IE 11.0.8, which does not honor false.
        preserveDrawingBuffer: true,
      };
      const contextOptions = {
        allowTextureFilterAnisotropic: false,
        webgl: webglOptions,
      };

      viewer = createViewer(container, {
        contextOptions: contextOptions,
      });

      const context = viewer.scene.context;
      const contextAttributes = context._gl.getContextAttributes();

      expect(context.options.allowTextureFilterAnisotropic).toEqual(false);
      expect(contextAttributes.alpha).toEqual(webglOptions.alpha);
      expect(contextAttributes.depth).toEqual(webglOptions.depth);
      expect(contextAttributes.stencil).toEqual(webglOptions.stencil);
      expect(contextAttributes.antialias).toEqual(webglOptions.antialias);
      expect(contextAttributes.powerPreference).toEqual(
        webglOptions.powerPreference
      );
      expect(contextAttributes.premultipliedAlpha).toEqual(
        webglOptions.premultipliedAlpha
      );
      expect(contextAttributes.preserveDrawingBuffer).toEqual(
        webglOptions.preserveDrawingBuffer
      );
    });

    it("can disable Order Independent Translucency", function () {
      viewer = createViewer(container, {
        orderIndependentTranslucency: false,
      });
      expect(viewer.scene.orderIndependentTranslucency).toBe(false);
    });

    it("can set scene mode", function () {
      viewer = createViewer(container, {
        sceneMode: SceneMode.SCENE2D,
      });
      viewer.scene.completeMorph();
      expect(viewer.scene.mode).toBe(SceneMode.SCENE2D);
    });

    it("can set map projection", function () {
      const mapProjection = new WebMercatorProjection();

      viewer = createViewer(container, {
        mapProjection: mapProjection,
      });
      expect(viewer.scene.mapProjection).toEqual(mapProjection);
    });

    it("can set selectedImageryProviderViewModel", async function () {
      viewer = createViewer(container, {
        selectedImageryProviderViewModel: testProviderViewModel,
      });
      await pollToPromise(() => viewer.scene.imageryLayers.get(0).ready);
      expect(viewer.scene.imageryLayers.length).toEqual(1);
      expect(viewer.scene.imageryLayers.get(0).imageryProvider).toBe(
        testProvider
      );
      expect(viewer.baseLayerPicker.viewModel.selectedImagery).toBe(
        testProviderViewModel
      );
    });

    it("can set imageryProviderViewModels", async function () {
      const models = [testProviderViewModel];

      viewer = createViewer(container, {
        imageryProviderViewModels: models,
      });
      await pollToPromise(() => viewer.scene.imageryLayers.get(0).ready);
      expect(viewer.scene.imageryLayers.length).toEqual(1);
      expect(viewer.scene.imageryLayers.get(0).imageryProvider).toBe(
        testProvider
      );
      expect(viewer.baseLayerPicker.viewModel.selectedImagery).toBe(
        testProviderViewModel
      );
      expect(
        viewer.baseLayerPicker.viewModel.imageryProviderViewModels.length
      ).toBe(models.length);
      expect(
        viewer.baseLayerPicker.viewModel.imageryProviderViewModels[0]
      ).toEqual(models[0]);
    });

    it("can set baseLayer when BaseLayerPicker is disabled", function () {
      viewer = createViewer(container, {
        baseLayerPicker: false,
        baseLayer: new ImageryLayer(testProvider),
      });
      expect(viewer.scene.imageryLayers.length).toEqual(1);
      expect(viewer.scene.imageryLayers.get(0).imageryProvider).toBe(
        testProvider
      );
    });

    it("can set baseLayer to false when BaseLayerPicker is disabled", function () {
      viewer = createViewer(container, {
        baseLayerPicker: false,
        baseLayer: false,
      });
      expect(viewer.scene.imageryLayers.length).toEqual(0);
    });

    it("can disable render loop", function () {
      viewer = createViewer(container, {
        useDefaultRenderLoop: false,
      });
      expect(viewer.useDefaultRenderLoop).toBe(false);
    });

    it("can set target frame rate", function () {
      viewer = createViewer(container, {
        targetFrameRate: 23,
      });
      expect(viewer.targetFrameRate).toBe(23);
    });

    it("does not create a globe if option is false", function () {
      viewer = createViewer(container, {
        globe: false,
      });
      expect(viewer.scene.globe).not.toBeDefined();
    });

    it("does not create a skyBox if option is false", function () {
      viewer = createViewer(container, {
        skyBox: false,
      });
      expect(viewer.scene.skyBox).not.toBeDefined();
    });

    it("does not create a skyAtmosphere if option is false", function () {
      viewer = createViewer(container, {
        skyAtmosphere: false,
      });
      expect(viewer.scene.skyAtmosphere).not.toBeDefined();
    });

    it("can set dataSources at construction", function () {
      const collection = new DataSourceCollection();
      viewer = createViewer(container, {
        dataSources: collection,
      });
      expect(viewer.dataSources).toBe(collection);
    });

    it("default DataSourceCollection is destroyed when Viewer is destroyed", function () {
      viewer = createViewer(container);
      const dataSources = viewer.dataSources;
      viewer.destroy();
      expect(dataSources.isDestroyed()).toBe(true);
    });

    it("specified DataSourceCollection is not destroyed when Viewer is destroyed", function () {
      const collection = new DataSourceCollection();
      viewer = createViewer(container, {
        dataSources: collection,
      });
      viewer.destroy();
      expect(collection.isDestroyed()).toBe(false);
    });

    it("throws if targetFrameRate less than 0", function () {
      viewer = createViewer(container);
      expect(function () {
        viewer.targetFrameRate = -1;
      }).toThrowDeveloperError();
    });

    it("can set resolutionScale", function () {
      viewer = createViewer(container);
      viewer.resolutionScale = 0.5;
      expect(viewer.resolutionScale).toBe(0.5);
    });

    it("throws if resolutionScale is less than 0", function () {
      viewer = createViewer(container);
      expect(function () {
        viewer.resolutionScale = -1;
      }).toThrowDeveloperError();
    });

    it("can enable useBrowserRecommendedResolution", function () {
      viewer = createViewer(container, {
        useBrowserRecommendedResolution: true,
      });

      expect(viewer.useBrowserRecommendedResolution).toBe(true);
    });

    it("useBrowserRecommendedResolution ignores devicePixelRatio", function () {
      const oldDevicePixelRatio = window.devicePixelRatio;
      window.devicePixelRatio = 2.0;

      viewer = createViewer(container, {
        useDefaultRenderLoop: false,
      });

      viewer.resolutionScale = 0.5;

      viewer.useBrowserRecommendedResolution = true;
      viewer.resize();
      expect(viewer.scene.pixelRatio).toEqual(0.5);

      viewer.useBrowserRecommendedResolution = false;
      viewer.resize();
      expect(viewer.scene.pixelRatio).toEqual(1.0);

      window.devicePixelRatio = oldDevicePixelRatio;
    });

    it("constructor throws with undefined container", function () {
      expect(function () {
        return createViewer(undefined);
      }).toThrowDeveloperError();
    });

    it("constructor throws with non-existant string container", function () {
      expect(function () {
        return createViewer("doesNotExist");
      }).toThrowDeveloperError();
    });

    it("constructor throws if using selectedImageryProviderViewModel with BaseLayerPicker disabled", function () {
      expect(function () {
        return createViewer(container, {
          baseLayerPicker: false,
          selectedImageryProviderViewModel: testProviderViewModel,
        });
      }).toThrowDeveloperError();
    });

    it("extend throws with undefined mixin", function () {
      viewer = createViewer(container);
      expect(function () {
        return viewer.extend(undefined);
      }).toThrowDeveloperError();
    });

    it("stops the render loop when render throws", function () {
      viewer = createViewer(container);
      expect(viewer.useDefaultRenderLoop).toEqual(true);

      const error = "foo";
      viewer.scene.primitives.update = function () {
        throw error;
      };

      return pollToPromise(function () {
        return !viewer.useDefaultRenderLoop;
      }, "render loop to be disabled.");
    });

    it("sets the clock and timeline based on the first data source", function () {
      const dataSource = new MockDataSource();
      dataSource.clock = new DataSourceClock();
      dataSource.clock.startTime = JulianDate.fromIso8601("2013-08-01T18:00Z");
      dataSource.clock.stopTime = JulianDate.fromIso8601("2013-08-21T02:00Z");
      dataSource.clock.currentTime = JulianDate.fromIso8601(
        "2013-08-02T00:00Z"
      );
      dataSource.clock.clockRange = ClockRange.CLAMPED;
      dataSource.clock.clockStep = ClockStep.TICK_DEPENDENT;
      dataSource.clock.multiplier = 20.0;

      viewer = createViewer(container);
      return viewer.dataSources.add(dataSource).then(function () {
        expect(viewer.clock.startTime).toEqual(dataSource.clock.startTime);
        expect(viewer.clock.stopTime).toEqual(dataSource.clock.stopTime);
        expect(viewer.clock.currentTime).toEqual(dataSource.clock.currentTime);
        expect(viewer.clock.clockRange).toEqual(dataSource.clock.clockRange);
        expect(viewer.clock.clockStep).toEqual(dataSource.clock.clockStep);
        expect(viewer.clock.multiplier).toEqual(dataSource.clock.multiplier);
      });
    });

    it("sets the clock for multiple data sources", function () {
      const dataSource1 = new MockDataSource();
      dataSource1.clock = new DataSourceClock();
      dataSource1.clock.startTime = JulianDate.fromIso8601("2013-08-01T18:00Z");
      dataSource1.clock.stopTime = JulianDate.fromIso8601("2013-08-21T02:00Z");
      dataSource1.clock.currentTime = JulianDate.fromIso8601(
        "2013-08-02T00:00Z"
      );

      let dataSource2, dataSource3;
      viewer = createViewer(container);
      return viewer.dataSources
        .add(dataSource1)
        .then(function () {
          expect(viewer.clockTrackedDataSource).toBe(dataSource1);
          expect(viewer.clock.startTime).toEqual(dataSource1.clock.startTime);

          dataSource2 = new MockDataSource();
          dataSource2.clock = new DataSourceClock();
          dataSource2.clock.startTime = JulianDate.fromIso8601(
            "2014-08-01T18:00Z"
          );
          dataSource2.clock.stopTime = JulianDate.fromIso8601(
            "2014-08-21T02:00Z"
          );
          dataSource2.clock.currentTime = JulianDate.fromIso8601(
            "2014-08-02T00:00Z"
          );

          viewer.dataSources.add(dataSource2);
        })
        .then(function () {
          expect(viewer.clockTrackedDataSource).toBe(dataSource2);
          expect(viewer.clock.startTime).toEqual(dataSource2.clock.startTime);

          dataSource3 = new MockDataSource();
          dataSource3.clock = new DataSourceClock();
          dataSource3.clock.startTime = JulianDate.fromIso8601(
            "2015-08-01T18:00Z"
          );
          dataSource3.clock.stopTime = JulianDate.fromIso8601(
            "2015-08-21T02:00Z"
          );
          dataSource3.clock.currentTime = JulianDate.fromIso8601(
            "2015-08-02T00:00Z"
          );

          viewer.dataSources.add(dataSource3);
        })
        .then(function () {
          expect(viewer.clockTrackedDataSource).toBe(dataSource3);
          expect(viewer.clock.startTime).toEqual(dataSource3.clock.startTime);

          // Removing the last dataSource moves the clock to second-last.
          viewer.dataSources.remove(dataSource3);
          expect(viewer.clockTrackedDataSource).toBe(dataSource2);
          expect(viewer.clock.startTime).toEqual(dataSource2.clock.startTime);

          // Removing the first data source has no effect, because it's not active.
          viewer.dataSources.remove(dataSource1);
          expect(viewer.clockTrackedDataSource).toBe(dataSource2);
          expect(viewer.clock.startTime).toEqual(dataSource2.clock.startTime);
        });
    });

    it("updates the clock when the data source changes", function () {
      const dataSource = new MockDataSource();
      dataSource.clock = new DataSourceClock();
      dataSource.clock.startTime = JulianDate.fromIso8601("2013-08-01T18:00Z");
      dataSource.clock.stopTime = JulianDate.fromIso8601("2013-08-21T02:00Z");
      dataSource.clock.currentTime = JulianDate.fromIso8601(
        "2013-08-02T00:00Z"
      );
      dataSource.clock.clockRange = ClockRange.CLAMPED;
      dataSource.clock.clockStep = ClockStep.TICK_DEPENDENT;
      dataSource.clock.multiplier = 20.0;

      viewer = createViewer(container);
      return viewer.dataSources.add(dataSource).then(function () {
        dataSource.clock.startTime = JulianDate.fromIso8601(
          "2014-08-01T18:00Z"
        );
        dataSource.clock.stopTime = JulianDate.fromIso8601("2014-08-21T02:00Z");
        dataSource.clock.currentTime = JulianDate.fromIso8601(
          "2014-08-02T00:00Z"
        );
        dataSource.clock.clockRange = ClockRange.UNBOUNDED;
        dataSource.clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER;
        dataSource.clock.multiplier = 10.0;

        dataSource.changedEvent.raiseEvent(dataSource);

        expect(viewer.clock.startTime).toEqual(dataSource.clock.startTime);
        expect(viewer.clock.stopTime).toEqual(dataSource.clock.stopTime);
        expect(viewer.clock.currentTime).toEqual(dataSource.clock.currentTime);
        expect(viewer.clock.clockRange).toEqual(dataSource.clock.clockRange);
        expect(viewer.clock.clockStep).toEqual(dataSource.clock.clockStep);
        expect(viewer.clock.multiplier).toEqual(dataSource.clock.multiplier);

        dataSource.clock.clockStep = ClockStep.SYSTEM_CLOCK;
        dataSource.clock.multiplier = 1.0;

        dataSource.changedEvent.raiseEvent(dataSource);

        expect(viewer.clock.clockStep).toEqual(dataSource.clock.clockStep);
      });
    });

    it("can manually control the clock tracking", function () {
      const dataSource1 = new MockDataSource();
      dataSource1.clock = new DataSourceClock();
      dataSource1.clock.startTime = JulianDate.fromIso8601("2013-08-01T18:00Z");
      dataSource1.clock.stopTime = JulianDate.fromIso8601("2013-08-21T02:00Z");
      dataSource1.clock.currentTime = JulianDate.fromIso8601(
        "2013-08-02T00:00Z"
      );

      viewer = createViewer(container, {
        automaticallyTrackDataSourceClocks: false,
      });

      let dataSource2;
      return viewer.dataSources
        .add(dataSource1)
        .then(function () {
          // Because of the above Viewer option, data sources are not automatically
          // selected for clock tracking.
          expect(viewer.clockTrackedDataSource).not.toBeDefined();
          // The mock data source time is in the past, so will not be the default time.
          expect(viewer.clock.startTime).not.toEqual(
            dataSource1.clock.startTime
          );

          // Manually set the first data source as the tracked data source.
          viewer.clockTrackedDataSource = dataSource1;
          expect(viewer.clockTrackedDataSource).toBe(dataSource1);
          expect(viewer.clock.startTime).toEqual(dataSource1.clock.startTime);

          dataSource2 = new MockDataSource();
          dataSource2.clock = new DataSourceClock();
          dataSource2.clock.startTime = JulianDate.fromIso8601(
            "2014-08-01T18:00Z"
          );
          dataSource2.clock.stopTime = JulianDate.fromIso8601(
            "2014-08-21T02:00Z"
          );
          dataSource2.clock.currentTime = JulianDate.fromIso8601(
            "2014-08-02T00:00Z"
          );

          // Adding a second data source in manual mode still leaves the first one tracked.
          viewer.dataSources.add(dataSource2);
        })
        .then(function () {
          expect(viewer.clockTrackedDataSource).toBe(dataSource1);
          expect(viewer.clock.startTime).toEqual(dataSource1.clock.startTime);

          // Removing the tracked data source in manual mode turns off tracking, even
          // if other data sources remain available for tracking.
          viewer.dataSources.remove(dataSource1);
          expect(viewer.clockTrackedDataSource).not.toBeDefined();
        });
    });

    it("shows the error panel when render throws", function () {
      viewer = createViewer(container);

      const error = "foo";
      viewer.scene.primitives.update = function () {
        throw error;
      };

      return pollToPromise(function () {
        return !viewer.useDefaultRenderLoop;
      }).catch(function () {
        expect(
          viewer._element.querySelector(".cesium-widget-errorPanel")
        ).not.toBeNull();

        const messages = viewer._element.querySelectorAll(
          ".cesium-widget-errorPanel-message"
        );

        let found = false;
        for (let i = 0; i < messages.length; ++i) {
          if (messages[i].textContent.indexOf(error) !== -1) {
            found = true;
          }
        }

        expect(found).toBe(true);

        // click the OK button to dismiss the panel
        DomEventSimulator.fireClick(
          viewer._element.querySelector(".cesium-button")
        );

        expect(
          viewer._element.querySelector(".cesium-widget-errorPanel")
        ).toBeNull();
      });
    });

    it("does not show the error panel if disabled", function () {
      viewer = createViewer(container, {
        showRenderLoopErrors: false,
      });

      const error = "foo";
      viewer.scene.primitives.update = function () {
        throw error;
      };

      return pollToPromise(function () {
        return !viewer.useDefaultRenderLoop;
      }).catch(function () {
        expect(
          viewer._element.querySelector(".cesium-widget-errorPanel")
        ).toBeNull();
      });
    });

    it("can enable requestRender mode", function () {
      viewer = createViewer(container, {
        requestRenderMode: true,
      });

      expect(viewer.scene.requestRenderMode).toBe(true);
    });

    it("can set maximumRenderTimeChange", function () {
      viewer = createViewer(container, {
        maximumRenderTimeChange: Number.POSITIVE_INFINITY,
      });

      expect(viewer.scene.maximumRenderTimeChange).toBe(
        Number.POSITIVE_INFINITY
      );
    });

    it("can set depthPlaneEllipsoidOffset", function () {
      viewer = createViewer(container, {
        depthPlaneEllipsoidOffset: Number.POSITIVE_INFINITY,
      });

      expect(viewer.scene._depthPlane._ellipsoidOffset).toBe(
        Number.POSITIVE_INFINITY
      );
    });

    it("can get and set trackedEntity", function () {
      viewer = createViewer(container);

      const entity = new Entity();
      entity.position = new ConstantProperty(
        new Cartesian3(123456, 123456, 123456)
      );

      viewer.trackedEntity = entity;
      expect(viewer.trackedEntity).toBe(entity);

      viewer.trackedEntity = undefined;
      expect(viewer.trackedEntity).toBeUndefined();
    });

    it("can get and set selectedEntity", function () {
      const viewer = createViewer(container);

      const dataSource = new MockDataSource();
      viewer.dataSources.add(dataSource);

      const entity = new Entity();
      entity.position = new ConstantPositionProperty(
        new Cartesian3(123456, 123456, 123456)
      );

      dataSource.entities.add(entity);

      viewer.selectedEntity = entity;
      expect(viewer.selectedEntity).toBe(entity);

      viewer.selectedEntity = undefined;
      expect(viewer.selectedEntity).toBeUndefined();

      viewer.destroy();
    });

    it("raises an event when the selected entity changes", function () {
      const viewer = createViewer(container);

      const dataSource = new MockDataSource();
      viewer.dataSources.add(dataSource);

      const entity = new Entity();
      entity.position = new ConstantPositionProperty(
        new Cartesian3(123456, 123456, 123456)
      );

      dataSource.entities.add(entity);

      let myEntity;
      viewer.selectedEntityChanged.addEventListener(function (newSelection) {
        myEntity = newSelection;
      });
      viewer.selectedEntity = entity;
      expect(myEntity).toBe(entity);

      viewer.selectedEntity = undefined;
      expect(myEntity).toBeUndefined();

      viewer.destroy();
    });

    it("raises an event when the tracked entity changes", function () {
      const viewer = createViewer(container);

      const dataSource = new MockDataSource();
      viewer.dataSources.add(dataSource);

      const entity = new Entity();
      entity.position = new ConstantPositionProperty(
        new Cartesian3(123456, 123456, 123456)
      );

      dataSource.entities.add(entity);

      let myEntity;
      viewer.trackedEntityChanged.addEventListener(function (newValue) {
        myEntity = newValue;
      });
      viewer.trackedEntity = entity;
      expect(myEntity).toBe(entity);

      viewer.trackedEntity = undefined;
      expect(myEntity).toBeUndefined();

      viewer.destroy();
    });

    it("selectedEntity sets InfoBox properties", function () {
      const viewer = createViewer(container);

      const entity = new Entity();

      const viewModel = viewer.infoBox.viewModel;
      expect(viewModel.showInfo).toBe(false);

      viewer.selectedEntity = entity;

      viewer.clock.tick();
      expect(viewModel.showInfo).toBe(true);
      expect(viewModel.titleText).toEqual(entity.id);
      expect(viewModel.description).toEqual("");

      entity.name = "Yes, this is name.";
      entity.description = "tubelcane";

      viewer.clock.tick();
      expect(viewModel.showInfo).toBe(true);
      expect(viewModel.titleText).toEqual(entity.name);
      expect(viewModel.description).toEqual(entity.description.getValue());

      viewer.selectedEntity = undefined;

      viewer.clock.tick();
      expect(viewModel.showInfo).toBe(false);
      expect(viewModel.titleText).toEqual("");
      expect(viewModel.description).toEqual("");

      viewer.destroy();
    });

    it("home button resets tracked object", function () {
      viewer = createViewer(container);

      const entity = new Entity();
      entity.position = new ConstantProperty(
        new Cartesian3(123456, 123456, 123456)
      );

      viewer.trackedEntity = entity;
      expect(viewer.trackedEntity).toBe(entity);

      //Needed to avoid actually creating a flight when we issue the home command.
      spyOn(CameraFlightPath, "createTween").and.returnValue({
        startObject: {},
        stopObject: {},
        duration: 0.0,
      });

      viewer.homeButton.viewModel.command();
      expect(viewer.trackedEntity).toBeUndefined();
    });

    it("stops tracking when tracked object is removed", function () {
      viewer = createViewer(container);

      const entity = new Entity();
      entity.position = new ConstantProperty(
        new Cartesian3(123456, 123456, 123456)
      );

      const dataSource = new MockDataSource();
      dataSource.entities.add(entity);

      viewer.dataSources.add(dataSource);
      viewer.trackedEntity = entity;

      expect(viewer.trackedEntity).toBe(entity);

      return pollToPromise(function () {
        viewer.render();
        return Cartesian3.equals(
          Matrix4.getTranslation(
            viewer.scene.camera.transform,
            new Cartesian3()
          ),
          entity.position.getValue()
        );
      }).then(function () {
        dataSource.entities.remove(entity);

        expect(viewer.trackedEntity).toBeUndefined();
        expect(viewer.scene.camera.transform).toEqual(Matrix4.IDENTITY);

        dataSource.entities.add(entity);
        viewer.trackedEntity = entity;

        expect(viewer.trackedEntity).toBe(entity);

        return pollToPromise(function () {
          viewer.render();
          viewer.render();
          return Cartesian3.equals(
            Matrix4.getTranslation(
              viewer.scene.camera.transform,
              new Cartesian3()
            ),
            entity.position.getValue()
          );
        }).then(function () {
          viewer.dataSources.remove(dataSource);

          expect(viewer.trackedEntity).toBeUndefined();
          expect(viewer.scene.camera.transform).toEqual(Matrix4.IDENTITY);
        });
      });
    });

    it("does not crash when tracking an object with a position property whose value is undefined.", function () {
      viewer = createViewer(container);

      const entity = new Entity();
      entity.position = new ConstantProperty(undefined);
      entity.polyline = {
        positions: [
          Cartesian3.fromDegrees(0, 0, 0),
          Cartesian3.fromDegrees(0, 0, 1),
        ],
      };

      viewer.entities.add(entity);
      viewer.trackedEntity = entity;

      spyOn(viewer.scene.renderError, "raiseEvent");
      return pollToPromise(function () {
        viewer.render();
        return viewer.dataSourceDisplay.update(viewer.clock.currentTime);
      }).then(function () {
        expect(viewer.scene.renderError.raiseEvent).not.toHaveBeenCalled();
      });
    });

    it("zoomTo throws if target is not defined", function () {
      viewer = createViewer(container);

      expect(function () {
        viewer.zoomTo();
      }).toThrowDeveloperError();
    });

    it("zoomTo zooms to Cesium3DTileset with default offset when offset not defined", async function () {
      viewer = createViewer(container);

      const path =
        "./Data/Cesium3DTiles/Tilesets/TilesetOfTilesets/tileset.json";
      const tileset = await Cesium3DTileset.fromUrl(path);

      const expectedBoundingSphere = tileset.boundingSphere;
      const expectedOffset = new HeadingPitchRange(
        0.0,
        -0.5,
        expectedBoundingSphere.radius
      );

      let wasCompleted = false;
      spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
        boundingSphere,
        offset
      ) {
        expect(boundingSphere).toEqual(expectedBoundingSphere);
        expect(offset).toEqual(expectedOffset);
        wasCompleted = true;
      });
      const promise = viewer.zoomTo(tileset);

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("zoomTo zooms to Cesium3DTileset with offset", async function () {
      viewer = createViewer(container);

      const path =
        "./Data/Cesium3DTiles/Tilesets/TilesetOfTilesets/tileset.json";
      const tileset = await Cesium3DTileset.fromUrl(path);

      const expectedBoundingSphere = tileset.boundingSphere;
      const expectedOffset = new HeadingPitchRange(
        0.4,
        1.2,
        4.0 * expectedBoundingSphere.radius
      );

      const promise = viewer.zoomTo(tileset, expectedOffset);
      let wasCompleted = false;
      spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
        boundingSphere,
        offset
      ) {
        expect(boundingSphere).toEqual(expectedBoundingSphere);
        expect(offset).toEqual(expectedOffset);
        wasCompleted = true;
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    async function loadTimeDynamicPointCloud(viewer) {
      const scene = viewer.scene;
      const clock = viewer.clock;

      const uri =
        "./Data/Cesium3DTiles/PointCloud/PointCloudTimeDynamic/0.pnts";
      const dates = ["2018-07-19T15:18:00Z", "2018-07-19T15:18:00.5Z"];

      function dataCallback() {
        return {
          uri: uri,
        };
      }

      const timeIntervalCollection = TimeIntervalCollection.fromIso8601DateArray(
        {
          iso8601Dates: dates,
          dataCallback: dataCallback,
        }
      );

      const pointCloud = new TimeDynamicPointCloud({
        intervals: timeIntervalCollection,
        clock: clock,
      });

      const start = JulianDate.fromIso8601(dates[0]);

      clock.startTime = start;
      clock.currentTime = start;
      clock.multiplier = 0.0;

      scene.primitives.add(pointCloud);

      await pollToPromise(function () {
        scene.render();
        return defined(pointCloud.boundingSphere);
      });

      return pointCloud;
    }

    it("zoomTo zooms to TimeDynamicPointCloud with default offset when offset not defined", function () {
      viewer = createViewer(container);
      return loadTimeDynamicPointCloud(viewer).then(function (pointCloud) {
        const expectedBoundingSphere = pointCloud.boundingSphere;
        const expectedOffset = new HeadingPitchRange(
          0.0,
          -0.5,
          expectedBoundingSphere.radius
        );

        const promise = viewer.zoomTo(pointCloud);
        let wasCompleted = false;
        spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
          boundingSphere,
          offset
        ) {
          expect(boundingSphere).toEqual(expectedBoundingSphere);
          expect(offset).toEqual(expectedOffset);
          wasCompleted = true;
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
          viewer.scene.primitives.remove(pointCloud);
        });
      });
    });

    it("zoomTo zooms to TimeDynamicPointCloud with offset", function () {
      viewer = createViewer(container);
      return loadTimeDynamicPointCloud(viewer).then(function (pointCloud) {
        const expectedBoundingSphere = pointCloud.boundingSphere;
        const expectedOffset = new HeadingPitchRange(
          0.4,
          1.2,
          4.0 * expectedBoundingSphere.radius
        );

        const promise = viewer.zoomTo(pointCloud, expectedOffset);
        let wasCompleted = false;
        spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
          boundingSphere,
          offset
        ) {
          expect(boundingSphere).toEqual(expectedBoundingSphere);
          expect(offset).toEqual(expectedOffset);
          wasCompleted = true;
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
          viewer.scene.primitives.remove(pointCloud);
        });
      });
    });

    async function loadVoxelPrimitive(viewer) {
      const voxelPrimitive = new VoxelPrimitive({
        provider: await Cesium3DTilesVoxelProvider.fromUrl(
          "./Data/Cesium3DTiles/Voxel/VoxelEllipsoid3DTiles/tileset.json"
        ),
      });
      viewer.scene.primitives.add(voxelPrimitive);
      return voxelPrimitive;
    }

    it("zoomTo zooms to VoxelPrimitive with default offset when offset not defined", function () {
      viewer = createViewer(container);

      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const expectedBoundingSphere = voxelPrimitive.boundingSphere;
        const expectedOffset = new HeadingPitchRange(
          0.0,
          -0.5,
          expectedBoundingSphere.radius
        );

        const promise = viewer.zoomTo(voxelPrimitive);
        let wasCompleted = false;
        spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
          boundingSphere,
          offset
        ) {
          expect(boundingSphere).toEqual(expectedBoundingSphere);
          expect(offset).toEqual(expectedOffset);
          wasCompleted = true;
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("zoomTo zooms to VoxelPrimitive with offset", function () {
      viewer = createViewer(container);

      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const expectedBoundingSphere = voxelPrimitive.boundingSphere;
        const expectedOffset = new HeadingPitchRange(
          0.4,
          1.2,
          4.0 * expectedBoundingSphere.radius
        );

        const promise = viewer.zoomTo(voxelPrimitive, expectedOffset);
        let wasCompleted = false;
        spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
          boundingSphere,
          offset
        ) {
          expect(boundingSphere).toEqual(expectedBoundingSphere);
          expect(offset).toEqual(expectedOffset);
          wasCompleted = true;
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("zoomTo zooms to entity with undefined offset when offset not defined", function () {
      viewer = createViewer(container);
      viewer.entities.add({
        name: "Blue box",
        position: Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box: {
          dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
          material: Color.BLUE,
        },
      });

      const entities = viewer.entities;

      const promise = viewer.zoomTo(entities);
      let wasCompleted = false;
      spyOn(viewer._dataSourceDisplay, "getBoundingSphere").and.callFake(
        function () {
          return new BoundingSphere();
        }
      );

      spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
        boundingSphere,
        offset
      ) {
        expect(boundingSphere).toBeDefined();
        // expect offset to be undefined - doesn't use default bc of how zoomTo for entities is set up
        expect(offset).toBeUndefined();
        wasCompleted = true;
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("zoomTo zooms to entity with offset", function () {
      viewer = createViewer(container);
      viewer.entities.add({
        name: "Blue box",
        position: Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box: {
          dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
          material: Color.BLUE,
        },
      });

      const entities = viewer.entities;
      // fake temp offset
      const expectedOffset = new HeadingPitchRange(3.0, 0.2, 2.3);

      const promise = viewer.zoomTo(entities, expectedOffset);
      let wasCompleted = false;
      spyOn(viewer._dataSourceDisplay, "getBoundingSphere").and.callFake(
        function () {
          return new BoundingSphere();
        }
      );
      spyOn(viewer.camera, "viewBoundingSphere").and.callFake(function (
        boundingSphere,
        offset
      ) {
        expect(expectedOffset).toEqual(offset);
        wasCompleted = true;
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("zoomTo zooms to entity when globe is disabled", async function () {
      // Create viewer with globe disabled
      const viewer = createViewer(container, {
        globe: false,
        infoBox: false,
        selectionIndicator: false,
        shadows: true,
        shouldAnimate: true,
      });

      // Create position variable
      const position = Cartesian3.fromDegrees(-123.0744619, 44.0503706, 1000.0);

      // Add entity to viewer
      const entity = viewer.entities.add({
        position: position,
        model: {
          uri: "../SampleData/models/CesiumAir/Cesium_Air.glb",
        },
      });

      await viewer.zoomTo(entity);

      // Verify that no errors occurred
      expect(viewer.scene).toBeDefined();
      expect(viewer.scene.errorEvent).toBeUndefined();
    });

    it("flyTo throws if target is not defined", function () {
      viewer = createViewer(container);

      expect(function () {
        viewer.flyTo();
      }).toThrowDeveloperError();
    });

    it("flyTo flies to Cesium3DTileset with default offset when options not defined", async function () {
      viewer = createViewer(container);

      const path =
        "./Data/Cesium3DTiles/Tilesets/TilesetOfTilesets/tileset.json";
      const tileset = await Cesium3DTileset.fromUrl(path);

      const promise = viewer.flyTo(tileset);
      let wasCompleted = false;

      spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
        target,
        options
      ) {
        expect(options.offset).toBeDefined();
        expect(options.duration).toBeUndefined();
        expect(options.maximumHeight).toBeUndefined();
        wasCompleted = true;
        options.complete();
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("flyTo flies to Cesium3DTileset with default offset when offset not defined", async function () {
      viewer = createViewer(container);

      const path =
        "./Data/Cesium3DTiles/Tilesets/TilesetOfTilesets/tileset.json";
      const tileset = await Cesium3DTileset.fromUrl(path);

      const options = {};

      const promise = viewer.flyTo(tileset, options);
      let wasCompleted = false;

      spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
        target,
        options
      ) {
        expect(options.offset).toBeDefined();
        expect(options.duration).toBeUndefined();
        expect(options.maximumHeight).toBeUndefined();
        wasCompleted = true;
        options.complete();
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("flyTo flies to Cesium3DTileset when options are defined", async function () {
      viewer = createViewer(container);

      const path =
        "./Data/Cesium3DTiles/Tilesets/TilesetOfTilesets/tileset.json";
      const tileset = await Cesium3DTileset.fromUrl(path);

      const offsetVal = new HeadingPitchRange(3.0, 0.2, 2.3);
      const options = {
        offset: offsetVal,
        duration: 3.0,
        maximumHeight: 5.0,
      };

      const promise = viewer.flyTo(tileset, options);
      let wasCompleted = false;

      spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
        target,
        options
      ) {
        expect(options.duration).toBeDefined();
        expect(options.maximumHeight).toBeDefined();
        wasCompleted = true;
        options.complete();
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("flyTo flies to TimeDynamicPointCloud with default offset when options not defined", function () {
      viewer = createViewer(container);
      return loadTimeDynamicPointCloud(viewer).then(function (pointCloud) {
        const promise = viewer.flyTo(pointCloud);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.offset).toBeDefined();
          expect(options.duration).toBeUndefined();
          expect(options.maximumHeight).toBeUndefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
          viewer.scene.primitives.remove(pointCloud);
        });
      });
    });

    it("flyTo flies to TimeDynamicPointCloud with default offset when offset not defined", function () {
      viewer = createViewer(container);
      return loadTimeDynamicPointCloud(viewer).then(function (pointCloud) {
        const options = {};
        const promise = viewer.flyTo(pointCloud, options);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.offset).toBeDefined();
          expect(options.duration).toBeUndefined();
          expect(options.maximumHeight).toBeUndefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
          viewer.scene.primitives.remove(pointCloud);
        });
      });
    });

    it("flyTo flies to TimeDynamicPointCloud when options are defined", function () {
      viewer = createViewer(container);
      return loadTimeDynamicPointCloud(viewer).then(function (pointCloud) {
        const offsetVal = new HeadingPitchRange(3.0, 0.2, 2.3);
        const options = {
          offset: offsetVal,
          duration: 3.0,
          maximumHeight: 5.0,
        };
        const promise = viewer.flyTo(pointCloud, options);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.duration).toBeDefined();
          expect(options.maximumHeight).toBeDefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
          viewer.scene.primitives.remove(pointCloud);
        });
      });
    });

    it("flyTo flies to VoxelPrimitive with default offset when options not defined", function () {
      viewer = createViewer(container);

      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const promise = viewer.flyTo(voxelPrimitive);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.offset).toBeDefined();
          expect(options.duration).toBeUndefined();
          expect(options.maximumHeight).toBeUndefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("flyTo flies to VoxelPrimitive with default offset when offset not defined", function () {
      viewer = createViewer(container);
      const options = {};

      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const promise = viewer.flyTo(voxelPrimitive, options);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.offset).toBeDefined();
          expect(options.duration).toBeUndefined();
          expect(options.maximumHeight).toBeUndefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("flyTo flies to VoxelPrimitive when options are defined", function () {
      viewer = createViewer(container);

      // load tileset to test
      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const offsetVal = new HeadingPitchRange(3.0, 0.2, 2.3);
        const options = {
          offset: offsetVal,
          duration: 3.0,
          maximumHeight: 5.0,
        };

        const promise = viewer.flyTo(voxelPrimitive, options);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.duration).toBeDefined();
          expect(options.maximumHeight).toBeDefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("flyTo flies to entity with default offset when options not defined", function () {
      viewer = createViewer(container);

      viewer.entities.add({
        name: "Blue box",
        position: Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box: {
          dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
          material: Color.BLUE,
        },
      });

      const entities = viewer.entities;
      const promise = viewer.flyTo(entities);
      let wasCompleted = false;
      spyOn(viewer._dataSourceDisplay, "getBoundingSphere").and.callFake(
        function () {
          return new BoundingSphere();
        }
      );
      spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
        target,
        options
      ) {
        expect(options.duration).toBeUndefined();
        expect(options.maximumHeight).toBeUndefined();
        wasCompleted = true;
        options.complete();
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("flyTo flies to imagery layer with default offset when options are not defined", async function () {
      viewer = createViewer(container);

      const imageryLayer = new ImageryLayer(testProvider);

      const promise = viewer.flyTo(imageryLayer, {
        duration: 0,
      });

      viewer._postRender();

      await expectAsync(promise).toBeResolved();
    });

    it("flyTo flies to VoxelPrimitive with default offset when options not defined", function () {
      viewer = createViewer(container);

      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const promise = viewer.flyTo(voxelPrimitive);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.offset).toBeDefined();
          expect(options.duration).toBeUndefined();
          expect(options.maximumHeight).toBeUndefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("flyTo flies to VoxelPrimitive with default offset when offset not defined", function () {
      viewer = createViewer(container);
      const options = {};

      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const promise = viewer.flyTo(voxelPrimitive, options);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.offset).toBeDefined();
          expect(options.duration).toBeUndefined();
          expect(options.maximumHeight).toBeUndefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("flyTo flies to VoxelPrimitive when options are defined", function () {
      viewer = createViewer(container);

      // load tileset to test
      return loadVoxelPrimitive(viewer).then(function (voxelPrimitive) {
        const offsetVal = new HeadingPitchRange(3.0, 0.2, 2.3);
        const options = {
          offset: offsetVal,
          duration: 3.0,
          maximumHeight: 5.0,
        };

        const promise = viewer.flyTo(voxelPrimitive, options);
        let wasCompleted = false;

        spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
          target,
          options
        ) {
          expect(options.duration).toBeDefined();
          expect(options.maximumHeight).toBeDefined();
          wasCompleted = true;
          options.complete();
        });

        viewer._postRender();

        return promise.then(function () {
          expect(wasCompleted).toEqual(true);
        });
      });
    });

    it("flyTo flys to entity with default offset when offset not defined", function () {
      viewer = createViewer(container);

      viewer.entities.add({
        name: "Blue box",
        position: Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box: {
          dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
          material: Color.BLUE,
        },
      });

      const entities = viewer.entities;
      const options = {};

      const promise = viewer.flyTo(entities, options);
      let wasCompleted = false;
      spyOn(viewer._dataSourceDisplay, "getBoundingSphere").and.callFake(
        function () {
          return new BoundingSphere();
        }
      );
      spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
        target,
        options
      ) {
        expect(options.duration).toBeUndefined();
        expect(options.maximumHeight).toBeUndefined();
        wasCompleted = true;
        options.complete();
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("flyTo flies to entity when options are defined", function () {
      viewer = createViewer(container);

      viewer.entities.add({
        name: "Blue box",
        position: Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box: {
          dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
          material: Color.BLUE,
        },
      });

      const entities = viewer.entities;
      const offsetVal = new HeadingPitchRange(3.0, 0.2, 2.3);
      const options = {
        offset: offsetVal,
        duration: 3.0,
        maximumHeight: 5.0,
      };

      const promise = viewer.flyTo(entities, options);
      let wasCompleted = false;
      spyOn(viewer._dataSourceDisplay, "getBoundingSphere").and.callFake(
        function () {
          return new BoundingSphere();
        }
      );
      spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
        target,
        options
      ) {
        expect(options.duration).toBeDefined();
        expect(options.maximumHeight).toBeDefined();
        wasCompleted = true;
        options.complete();
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("flyTo flies to entity when offset is defined but other options for flyTo are not", function () {
      viewer = createViewer(container);

      viewer.entities.add({
        name: "Blue box",
        position: Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box: {
          dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
          material: Color.BLUE,
        },
      });

      const entities = viewer.entities;
      const offsetVal = new HeadingPitchRange(3.0, 0.2, 2.3);
      const options = {
        offset: offsetVal,
      };

      const promise = viewer.flyTo(entities, options);
      let wasCompleted = false;
      spyOn(viewer._dataSourceDisplay, "getBoundingSphere").and.callFake(
        function () {
          return new BoundingSphere();
        }
      );
      spyOn(viewer.camera, "flyToBoundingSphere").and.callFake(function (
        target,
        options
      ) {
        expect(options.duration).toBeUndefined();
        expect(options.maximumHeight).toBeUndefined();
        wasCompleted = true;
        options.complete();
      });

      viewer._postRender();

      return promise.then(function () {
        expect(wasCompleted).toEqual(true);
      });
    });

    it("removes data source listeners when destroyed", function () {
      viewer = createViewer(container);

      //one data source that is added before mixing in
      const preMixinDataSource = new MockDataSource();
      //one data source that is added after mixing in
      const postMixinDataSource = new MockDataSource();
      return viewer.dataSources
        .add(preMixinDataSource)
        .then(function () {
          viewer.dataSources.add(postMixinDataSource);
        })
        .then(function () {
          const preMixinListenerCount =
            preMixinDataSource.entities.collectionChanged._listeners.length;
          const postMixinListenerCount =
            postMixinDataSource.entities.collectionChanged._listeners.length;

          viewer = viewer.destroy();

          expect(
            preMixinDataSource.entities.collectionChanged._listeners.length
          ).not.toEqual(preMixinListenerCount);
          expect(
            postMixinDataSource.entities.collectionChanged._listeners.length
          ).not.toEqual(postMixinListenerCount);
        });
    });
  },
  "WebGL"
);
