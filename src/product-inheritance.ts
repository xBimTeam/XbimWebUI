export class Product {
    public name: string;
    public id: number;
    public abs: boolean;
    public children?: Product[];

    public static getByName(name: string): Product {
        name = name.toUpperCase();
        let toProcess: Product[] = [ProductInheritance];
        while (toProcess.length !== 0) {
            const type = toProcess.shift();
            if (type.name.toUpperCase() === name) {
                return type;
            }
            if (type.children) {
                type.children.forEach((c) => { toProcess.push(c); });
            }
        }
        return null;
    }

    public static getAllSubTypes(root: number): {[id: number]: boolean} {
        // find roots
        const roots: Product[] = [];
        let toProcess: Product[] = [ProductInheritance];
        while (toProcess.length !== 0) {
            const type = toProcess.shift();
            if (type.id === root) {
                roots.push(type);
            }
            if (type.children) {
                type.children.forEach((c) => { toProcess.push(c); });
            }
        }

        // collect all non-abstract sub types
        toProcess = roots.slice();
        const result: {[id: number]: boolean} = {};
        while (toProcess.length !== 0) {
            const type = toProcess.shift();
            if (type.abs === false) {
                result[type.id] = true;
            }
            if (type.children) {
                type.children.forEach((c) => { toProcess.push(c); });
            }
        }

        return result;
    }
}

const ProductInheritance: Product = {
    name: "IfcProduct",
    id: 20,
    abs: true,
    children: [
        {
            name: "IfcElement",
            id: 19,
            abs: true,
            children: [
                {
                    name: "IfcDistributionElement",
                    id: 44,
                    abs: false,
                    children: [
                        {
                            name: "IfcDistributionFlowElement",
                            id: 45,
                            abs: false,
                            children: [
                                { name: "IfcDistributionChamberElement", id: 180, abs: false },
                                {
                                    name: "IfcEnergyConversionDevice",
                                    id: 175,
                                    abs: false,
                                    children: [
                                        { name: "IfcAirToAirHeatRecovery", id: 1097, abs: false },
                                        { name: "IfcBoiler", id: 1105, abs: false },
                                        { name: "IfcBurner", id: 1109, abs: false },
                                        { name: "IfcChiller", id: 1119, abs: false },
                                        { name: "IfcCoil", id: 1124, abs: false },
                                        { name: "IfcCondenser", id: 1132, abs: false },
                                        { name: "IfcCooledBeam", id: 1141, abs: false },
                                        { name: "IfcCoolingTower", id: 1142, abs: false },
                                        { name: "IfcEngine", id: 1164, abs: false },
                                        { name: "IfcEvaporativeCooler", id: 1166, abs: false },
                                        { name: "IfcEvaporator", id: 1167, abs: false },
                                        { name: "IfcHeatExchanger", id: 1187, abs: false },
                                        { name: "IfcHumidifier", id: 1188, abs: false },
                                        { name: "IfcTubeBundle", id: 1305, abs: false },
                                        { name: "IfcUnitaryEquipment", id: 1310, abs: false },
                                        { name: "IfcElectricGenerator", id: 1160, abs: false },
                                        { name: "IfcElectricMotor", id: 1161, abs: false },
                                        { name: "IfcMotorConnection", id: 1216, abs: false },
                                        { name: "IfcSolarDevice", id: 1270, abs: false },
                                        { name: "IfcTransformer", id: 1303, abs: false }
                                    ]
                                }, {
                                    name: "IfcFlowController",
                                    id: 121,
                                    abs: false,
                                    children: [
                                        { name: "IfcElectricDistributionPoint", id: 242, abs: false },
                                        { name: "IfcAirTerminalBox", id: 1096, abs: false },
                                        { name: "IfcDamper", id: 1148, abs: false },
                                        { name: "IfcFlowMeter", id: 1182, abs: false },
                                        { name: "IfcValve", id: 1311, abs: false },
                                        { name: "IfcElectricDistributionBoard", id: 1157, abs: false },
                                        { name: "IfcElectricTimeControl", id: 1162, abs: false },
                                        { name: "IfcProtectiveDevice", id: 1235, abs: false },
                                        { name: "IfcSwitchingDevice", id: 1290, abs: false }
                                    ]
                                }, {
                                    name: "IfcFlowFitting",
                                    id: 467,
                                    abs: false,
                                    children: [
                                        { name: "IfcDuctFitting", id: 1153, abs: false },
                                        { name: "IfcPipeFitting", id: 1222, abs: false },
                                        { name: "IfcCableCarrierFitting", id: 1111, abs: false },
                                        { name: "IfcCableFitting", id: 1113, abs: false },
                                        { name: "IfcJunctionBox", id: 1195, abs: false }
                                    ]
                                }, {
                                    name: "IfcFlowMovingDevice",
                                    id: 502,
                                    abs: false,
                                    children: [
                                        { name: "IfcCompressor", id: 1131, abs: false },
                                        { name: "IfcFan", id: 1177, abs: false },
                                        { name: "IfcPump", id: 1238, abs: false }
                                    ]
                                }, {
                                    name: "IfcFlowSegment",
                                    id: 574,
                                    abs: false,
                                    children: [
                                        { name: "IfcDuctSegment", id: 1154, abs: false },
                                        { name: "IfcPipeSegment", id: 1223, abs: false },
                                        { name: "IfcCableCarrierSegment", id: 1112, abs: false },
                                        { name: "IfcCableSegment", id: 1115, abs: false }
                                    ]
                                }, {
                                    name: "IfcFlowStorageDevice",
                                    id: 371,
                                    abs: false,
                                    children: [
                                        { name: "IfcTank", id: 1293, abs: false },
                                        { name: "IfcElectricFlowStorageDevice", id: 1159, abs: false }
                                    ]
                                }, {
                                    name: "IfcFlowTerminal",
                                    id: 46,
                                    abs: false,
                                    children: [
                                        { name: "IfcFireSuppressionTerminal", id: 1179, abs: false },
                                        { name: "IfcSanitaryTerminal", id: 1262, abs: false },
                                        { name: "IfcStackTerminal", id: 1277, abs: false },
                                        { name: "IfcWasteTerminal", id: 1315, abs: false },
                                        { name: "IfcAirTerminal", id: 1095, abs: false },
                                        { name: "IfcMedicalDevice", id: 1212, abs: false },
                                        { name: "IfcSpaceHeater", id: 1272, abs: false },
                                        { name: "IfcAudioVisualAppliance", id: 1099, abs: false },
                                        { name: "IfcCommunicationsAppliance", id: 1127, abs: false },
                                        { name: "IfcElectricAppliance", id: 1156, abs: false },
                                        { name: "IfcLamp", id: 1198, abs: false },
                                        { name: "IfcLightFixture", id: 1199, abs: false },
                                        { name: "IfcOutlet", id: 1219, abs: false }
                                    ]
                                }, {
                                    name: "IfcFlowTreatmentDevice",
                                    id: 425,
                                    abs: false,
                                    children: [
                                        { name: "IfcInterceptor", id: 1193, abs: false },
                                        { name: "IfcDuctSilencer", id: 1155, abs: false },
                                        { name: "IfcFilter", id: 1178, abs: false }
                                    ]
                                }
                            ]
                        }, {
                            name: "IfcDistributionControlElement",
                            id: 468,
                            abs: false,
                            children: [
                                { name: "IfcProtectiveDeviceTrippingUnit", id: 1236, abs: false },
                                { name: "IfcActuator", id: 1091, abs: false },
                                { name: "IfcAlarm", id: 1098, abs: false },
                                { name: "IfcController", id: 1139, abs: false },
                                { name: "IfcFlowInstrument", id: 1181, abs: false },
                                { name: "IfcSensor", id: 1264, abs: false },
                                { name: "IfcUnitaryControlElement", id: 1308, abs: false }
                            ]
                        }
                    ]
                }, {
                    name: "IfcElementComponent",
                    id: 424,
                    abs: true,
                    children: [
                        { name: "IfcDiscreteAccessory", id: 423, abs: false },
                        {
                            name: "IfcFastener",
                            id: 535,
                            abs: false,
                            children: [{ name: "IfcMechanicalFastener", id: 536, abs: false }]
                        }, {
                            name: "IfcReinforcingElement",
                            id: 262,
                            abs: true,
                            children: [
                                { name: "IfcReinforcingBar", id: 571, abs: false },
                                { name: "IfcReinforcingMesh", id: 531, abs: false },
                                { name: "IfcTendon", id: 261, abs: false },
                                { name: "IfcTendonAnchor", id: 675, abs: false }
                            ]
                        }, { name: "IfcBuildingElementPart", id: 220, abs: false },
                        { name: "IfcMechanicalFastener", id: 536, abs: false },
                        { name: "IfcVibrationIsolator", id: 1312, abs: false }
                    ]
                }, {
                    name: "IfcFeatureElement",
                    id: 386,
                    abs: true,
                    children: [
                        {
                            name: "IfcFeatureElementSubtraction",
                            id: 499,
                            abs: true,
                            children: [
                                {
                                    name: "IfcEdgeFeature",
                                    id: 764,
                                    abs: true,
                                    children: [
                                        { name: "IfcChamferEdgeFeature", id: 765, abs: false },
                                        { name: "IfcRoundedEdgeFeature", id: 766, abs: false }
                                    ]
                                }, {
                                    name: "IfcOpeningElement",
                                    id: 498,
                                    abs: false,
                                    children: [{ name: "IfcOpeningStandardCase", id: 1217, abs: false }]
                                }, { name: "IfcVoidingFeature", id: 1313, abs: false }
                            ]
                        }, {
                            name: "IfcFeatureElementAddition",
                            id: 385,
                            abs: true,
                            children: [{ name: "IfcProjectionElement", id: 384, abs: false }]
                        }, { name: "IfcSurfaceFeature", id: 1287, abs: false }
                    ]
                }, {
                    name: "IfcBuildingElement",
                    id: 26,
                    abs: true,
                    children: [
                        {
                            name: "IfcBuildingElementComponent",
                            id: 221,
                            abs: true,
                            children: [
                                { name: "IfcBuildingElementPart", id: 220, abs: false },
                                {
                                    name: "IfcReinforcingElement",
                                    id: 262,
                                    abs: true,
                                    children: [
                                        { name: "IfcReinforcingBar", id: 571, abs: false },
                                        { name: "IfcReinforcingMesh", id: 531, abs: false },
                                        { name: "IfcTendon", id: 261, abs: false },
                                        { name: "IfcTendonAnchor", id: 675, abs: false }
                                    ]
                                }
                            ]
                        }, { name: "IfcFooting", id: 120, abs: false }, { name: "IfcPile", id: 572, abs: false },
                        {
                            name: "IfcBeam",
                            id: 171,
                            abs: false,
                            children: [{ name: "IfcBeamStandardCase", id: 1104, abs: false }]
                        },
                        {
                            name: "IfcColumn",
                            id: 383,
                            abs: false,
                            children: [{ name: "IfcColumnStandardCase", id: 1126, abs: false }]
                        }, { name: "IfcCurtainWall", id: 456, abs: false },
                        {
                            name: "IfcDoor",
                            id: 213,
                            abs: false,
                            children: [{ name: "IfcDoorStandardCase", id: 1151, abs: false }]
                        },
                        {
                            name: "IfcMember",
                            id: 310,
                            abs: false,
                            children: [{ name: "IfcMemberStandardCase", id: 1214, abs: false }]
                        }, {
                            name: "IfcPlate",
                            id: 351,
                            abs: false,
                            children: [{ name: "IfcPlateStandardCase", id: 1224, abs: false }]
                        }, { name: "IfcRailing", id: 350, abs: false }, { name: "IfcRamp", id: 414, abs: false },
                        { name: "IfcRampFlight", id: 348, abs: false }, { name: "IfcRoof", id: 347, abs: false },
                        {
                            name: "IfcSlab",
                            id: 99,
                            abs: false,
                            children: [
                                { name: "IfcSlabElementedCase", id: 1268, abs: false },
                                { name: "IfcSlabStandardCase", id: 1269, abs: false }
                            ]
                        }, { name: "IfcStair", id: 346, abs: false }, { name: "IfcStairFlight", id: 25, abs: false },
                        {
                            name: "IfcWall",
                            id: 452,
                            abs: false,
                            children: [
                                { name: "IfcWallStandardCase", id: 453, abs: false },
                                { name: "IfcWallElementedCase", id: 1314, abs: false }
                            ]
                        }, {
                            name: "IfcWindow",
                            id: 667,
                            abs: false,
                            children: [{ name: "IfcWindowStandardCase", id: 1316, abs: false }]
                        }, { name: "IfcBuildingElementProxy", id: 560, abs: false },
                        { name: "IfcCovering", id: 382, abs: false },
                        { name: "IfcChimney", id: 1120, abs: false }, { name: "IfcShadingDevice", id: 1265, abs: false }
                    ]
                }, { name: "IfcElementAssembly", id: 18, abs: false },
                {
                    name: "IfcFurnishingElement",
                    id: 253,
                    abs: false,
                    children: [
                        { name: "IfcFurniture", id: 1184, abs: false },
                        { name: "IfcSystemFurnitureElement", id: 1291, abs: false }
                    ]
                }, { name: "IfcTransportElement", id: 416, abs: false },
                { name: "IfcVirtualElement", id: 168, abs: false },
                { name: "IfcElectricalElement", id: 23, abs: false },
                { name: "IfcEquipmentElement", id: 212, abs: false },
                { name: "IfcCivilElement", id: 1122, abs: false },
                { name: "IfcGeographicElement", id: 1185, abs: false }
            ]
        }, { name: "IfcPort", id: 179, abs: true, children: [{ name: "IfcDistributionPort", id: 178, abs: false }] },
        { name: "IfcProxy", id: 447, abs: false }, {
            name: "IfcStructuralActivity",
            id: 41,
            abs: true,
            children: [
                {
                    name: "IfcStructuralAction",
                    id: 40,
                    abs: true,
                    children: [
                        {
                            name: "IfcStructuralLinearAction",
                            id: 463,
                            abs: false,
                            children: [{ name: "IfcStructuralLinearActionVarying", id: 464, abs: false }]
                        }, {
                            name: "IfcStructuralPlanarAction",
                            id: 39,
                            abs: false,
                            children: [{ name: "IfcStructuralPlanarActionVarying", id: 357, abs: false }]
                        }, { name: "IfcStructuralPointAction", id: 356, abs: false },
                        {
                            name: "IfcStructuralCurveAction",
                            id: 1279,
                            abs: false,
                            children: [{ name: "IfcStructuralLinearAction", id: 463, abs: false }]
                        }, {
                            name: "IfcStructuralSurfaceAction",
                            id: 1284,
                            abs: false,
                            children: [{ name: "IfcStructuralPlanarAction", id: 39, abs: false }]
                        }
                    ]
                }, {
                    name: "IfcStructuralReaction",
                    id: 355,
                    abs: true,
                    children: [
                        { name: "IfcStructuralPointReaction", id: 354, abs: false },
                        { name: "IfcStructuralCurveReaction", id: 1280, abs: false },
                        { name: "IfcStructuralSurfaceReaction", id: 1285, abs: false }
                    ]
                }
            ]
        }, {
            name: "IfcStructuralItem",
            id: 226,
            abs: true,
            children: [
                {
                    name: "IfcStructuralConnection",
                    id: 265,
                    abs: true,
                    children: [
                        { name: "IfcStructuralCurveConnection", id: 534, abs: false },
                        { name: "IfcStructuralPointConnection", id: 533, abs: false },
                        { name: "IfcStructuralSurfaceConnection", id: 264, abs: false }
                    ]
                }, {
                    name: "IfcStructuralMember",
                    id: 225,
                    abs: true,
                    children: [
                        {
                            name: "IfcStructuralCurveMember",
                            id: 224,
                            abs: false,
                            children: [{ name: "IfcStructuralCurveMemberVarying", id: 227, abs: false }]
                        }, {
                            name: "IfcStructuralSurfaceMember",
                            id: 420,
                            abs: false,
                            children: [{ name: "IfcStructuralSurfaceMemberVarying", id: 421, abs: false }]
                        }
                    ]
                }
            ]
        }, { name: "IfcAnnotation", id: 634, abs: false }, {
            name: "IfcSpatialStructureElement",
            id: 170,
            abs: true,
            children: [
                { name: "IfcBuilding", id: 169, abs: false }, { name: "IfcBuildingStorey", id: 459, abs: false },
                { name: "IfcSite", id: 349, abs: false }, { name: "IfcSpace", id: 454, abs: false }
            ]
        }, { name: "IfcGrid", id: 564, abs: false }, {
            name: "IfcSpatialElement",
            id: 1273,
            abs: true,
            children: [
                {
                    name: "IfcSpatialStructureElement",
                    id: 170,
                    abs: true,
                    children: [
                        { name: "IfcBuilding", id: 169, abs: false },
                        { name: "IfcBuildingStorey", id: 459, abs: false },
                        { name: "IfcSite", id: 349, abs: false }, { name: "IfcSpace", id: 454, abs: false }
                    ]
                }, {
                    name: "IfcExternalSpatialStructureElement",
                    id: 1175,
                    abs: true,
                    children: [{ name: "IfcExternalSpatialElement", id: 1174, abs: false }]
                }, { name: "IfcSpatialZone", id: 1275, abs: false }
            ]
        }
    ]
};
