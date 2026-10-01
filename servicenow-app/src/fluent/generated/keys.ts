import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '320e64e7da504f6ca83de7d7dfa1ef41'
                    }
                    'nowrfid-api': {
                        table: 'sys_ws_definition'
                        id: '63e6515f5c2c4b49a87821f7faf2ac6c'
                    }
                    'nowrfid-api-asset-types': {
                        table: 'sys_ws_operation'
                        id: 'c1e3f5fe0dee489180d78bdf99cab7ad'
                    }
                    'nowrfid-api-asset-types-sync': {
                        table: 'sys_ws_operation'
                        id: 'f6d7f9074d694193b565b18fa8e7aa1a'
                    }
                    'nowrfid-api-batch': {
                        table: 'sys_ws_operation'
                        id: 'e9c451c4f78d47c4a31d5fcbbbba6f0b'
                    }
                    'nowrfid-api-dashboard': {
                        table: 'sys_ws_operation'
                        id: 'e1b2ccd070a74b5e8d1138072673bf4f'
                    }
                    'nowrfid-api-dashboard-promote': {
                        table: 'sys_ws_operation'
                        id: 'fc00d5715a2144a1b8eab9ac5a3a8a37'
                    }
                    'nowrfid-api-ping': {
                        table: 'sys_ws_operation'
                        id: '5482d21ca75e4aebb2b0a2e251c57152'
                    }
                    'nowrfid-api-promote': {
                        table: 'sys_ws_operation'
                        id: '8e29659b2b8a4b7aafa8cad0160332e6'
                    }
                    'nowrfid-api-structure': {
                        table: 'sys_ws_operation'
                        id: 'd7a7a1d09248487592021d49944ed81f'
                    }
                    'nowrfid-br-sync-classification': {
                        table: 'sys_script'
                        id: 'e3521b79b5b245c588e969bc64be0e3f'
                    }
                    'nowrfid-demo-seed-once': {
                        table: 'sysauto_script'
                        id: '29a180e0a7ea4c0f96e05b6df669f3b9'
                        deleted: false
                    }
                    'nowrfid-menu': {
                        table: 'sys_app_application'
                        id: '2412bb0cd16443b9a16ee6f8bce51972'
                    }
                    'nowrfid-module-batches': {
                        table: 'sys_app_module'
                        id: '6deabc3ef1464003b5cb2d54c9296d66'
                    }
                    'nowrfid-module-items': {
                        table: 'sys_app_module'
                        id: '2ea059e8264542aba56e05aa62983d8b'
                    }
                    'nowrfid-module-painel': {
                        table: 'sys_app_module'
                        id: '71005aff39cc4133ad54f09ffad0c184'
                    }
                    'nowrfid-module-pending': {
                        table: 'sys_app_module'
                        id: 'e9791ad1cebb40f99a8d49366f5a3744'
                    }
                    'nowrfid-module-tags': {
                        table: 'sys_app_module'
                        id: '471e31a404d94111a7676e20ebc538b5'
                    }
                    'nowrfid-module-types': {
                        table: 'sys_app_module'
                        id: 'f783d86037fe42c6a79d2dedd48ecb8d'
                    }
                    'nowrfid-prop-location-root': {
                        table: 'sys_properties'
                        id: '628260e5453d4f9d9ef4f01f8eaf3d51'
                        deleted: true
                    }
                    'nowrfid-rest-execute': {
                        table: 'sys_security_acl'
                        id: 'ae6f63e12e7a4fa8b7f75748a26346c0'
                    }
                    'nowrfid-rest-promote-execute': {
                        table: 'sys_security_acl'
                        id: '03b6c2e721c042c7afa4805752981f2a'
                    }
                    'nowrfid-ua-create-assets': {
                        table: 'sys_ui_action'
                        id: '77db59e237a64350ae2a999f43693388'
                    }
                    'nowrfid-ua-demo-remove': {
                        table: 'sys_ui_action'
                        id: '537e47091b1e47e6b93a9f6bc1a49e47'
                    }
                    'nowrfid-ua-demo-seed': {
                        table: 'sys_ui_action'
                        id: '751615796deb42c4822c716e955ab7c3'
                    }
                    'nowrfid-ua-sync-asset-types': {
                        table: 'sys_ui_action'
                        id: 'e1c9fedfd3c34464bd2d9225a296764a'
                    }
                    'nowrfid-xscope-alm_asset-create': {
                        table: 'sys_scope_privilege'
                        id: 'c44c0006d2b3449ebeb9d3fee5ae2044'
                    }
                    'nowrfid-xscope-alm_asset-read': {
                        table: 'sys_scope_privilege'
                        id: 'f89d7fbc49c648d3985c7de35eb5da9b'
                    }
                    'nowrfid-xscope-alm_asset-write': {
                        table: 'sys_scope_privilege'
                        id: '9020e1aa4769434786bad42674f8f6fb'
                    }
                    'nowrfid-xscope-alm_hardware-create': {
                        table: 'sys_scope_privilege'
                        id: 'edbc11523a494b5fb1bf97320b653685'
                    }
                    'nowrfid-xscope-alm_hardware-read': {
                        table: 'sys_scope_privilege'
                        id: '6fea64ef5289450188f05c88b02dac13'
                    }
                    'nowrfid-xscope-alm_hardware-write': {
                        table: 'sys_scope_privilege'
                        id: 'acd1c4e9e7264489b7aed63f6377caa1'
                    }
                    'nowrfid-xscope-alm_stockroom-read': {
                        table: 'sys_scope_privilege'
                        id: '5c6c82bafd8641d6bf8fb39e85d8c6aa'
                    }
                    'nowrfid-xscope-cmdb_hardware_product_model-read': {
                        table: 'sys_scope_privilege'
                        id: 'afdd7fcb477642c2b4bda197ddef7d09'
                    }
                    'nowrfid-xscope-cmdb_model_category-read': {
                        table: 'sys_scope_privilege'
                        id: '252bbb03675d4ec982781cb7462a7633'
                    }
                    'nowrfid-xscope-cmdb_model-read': {
                        table: 'sys_scope_privilege'
                        id: 'bfe9989433f2420aa88c8bf61ac68210'
                    }
                    'nowrfid-xscope-cmn_location-read': {
                        table: 'sys_scope_privilege'
                        id: 'b81172539b8748e4afc67fcd7b5ef471'
                    }
                    'nowrfid-xscope-sn_ent_asset-create': {
                        table: 'sys_scope_privilege'
                        id: '29e0f9d457524a9b82e380fabe626665'
                    }
                    'nowrfid-xscope-sn_ent_asset-read': {
                        table: 'sys_scope_privilege'
                        id: '1ccae17648fb40afb9ea8e7627ed2f2d'
                    }
                    'nowrfid-xscope-sn_ent_asset-write': {
                        table: 'sys_scope_privilege'
                        id: '4acc4b11c183490db9c3137d81b98b21'
                    }
                    'nowrfid-xscope-sn_ent_facility_asset-create': {
                        table: 'sys_scope_privilege'
                        id: '9f7890b8e4a048569090713ee3d09b3c'
                    }
                    'nowrfid-xscope-sn_ent_facility_asset-read': {
                        table: 'sys_scope_privilege'
                        id: '306db8250a7a4a92a597e6d47fd8cddb'
                    }
                    'nowrfid-xscope-sn_ent_facility_asset-write': {
                        table: 'sys_scope_privilege'
                        id: '58e787a5a4834d7ea073d9c962763d4a'
                    }
                    'nowrfid-xscope-sn_ent_model-read': {
                        table: 'sys_scope_privilege'
                        id: 'e55f77f0b06c4a089fda8e98387f514f'
                    }
                    'nowrfid-xscope-u_siaf_codigos-read': {
                        table: 'sys_scope_privilege'
                        id: '84e232e854a84d08b9bf9e88cb9aea77'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '2cce1c234bc940a79748279875566cd9'
                    }
                    'src_server_asset-tag-service_ts': {
                        table: 'sys_module'
                        id: '0f51194bdcc549cab77a76a5ba3090d7'
                    }
                    'src_server_asset-type-service_ts': {
                        table: 'sys_module'
                        id: 'd114dce99b884154b4e28d803702cd68'
                    }
                    'src_server_batch-service_ts': {
                        table: 'sys_module'
                        id: '84c2fdbf290b4f8fbb2a56066619199f'
                    }
                    'src_server_dashboard-service_ts': {
                        table: 'sys_module'
                        id: 'c96264b0ee5a465c8eb2ee8371c8207f'
                    }
                    'src_server_demo-service_ts': {
                        table: 'sys_module'
                        id: 'aee9339ed3cd4fec9da7ee61b061b37d'
                    }
                    'src_server_promote-service_ts': {
                        table: 'sys_module'
                        id: '1fe65c39c9e54904a7517e4f9b998301'
                    }
                    src_server_rest_handlers_ts: {
                        table: 'sys_module'
                        id: '4f1fc4127496473c88cbfc5bc5f142cc'
                    }
                    'src_server_structure-service_ts': {
                        table: 'sys_module'
                        id: '3500463443f04a44a7bccd60617338cc'
                    }
                    'x_snc_nowrfid_asset_type-create': {
                        table: 'sys_security_acl'
                        id: '28563bba0915442a9f3a3c01cda03722'
                    }
                    'x_snc_nowrfid_asset_type-delete': {
                        table: 'sys_security_acl'
                        id: 'c343b717294f4b688c67777b179d3a60'
                    }
                    'x_snc_nowrfid_asset_type-read': {
                        table: 'sys_security_acl'
                        id: 'a2697464f1fd4e32a46bd78c90a17e46'
                    }
                    'x_snc_nowrfid_asset_type-write': {
                        table: 'sys_security_acl'
                        id: '7decff96420e4035a47802af83a8849d'
                    }
                    'x_snc_nowrfid_counter-create': {
                        table: 'sys_security_acl'
                        id: '686c2c3557034e97807568ed6296e111'
                    }
                    'x_snc_nowrfid_counter-read': {
                        table: 'sys_security_acl'
                        id: '59982d72fb704701893c34584b0fb542'
                    }
                    'x_snc_nowrfid_counter-write': {
                        table: 'sys_security_acl'
                        id: 'f3e6d020f500439a918352672b50fc8d'
                    }
                    'x_snc_nowrfid_scan_batch-create': {
                        table: 'sys_security_acl'
                        id: '89f71255899c45f8ba0d7057a5655a25'
                    }
                    'x_snc_nowrfid_scan_batch-delete': {
                        table: 'sys_security_acl'
                        id: '0bdd00fa17a245d9ba8c029e4935b34f'
                    }
                    'x_snc_nowrfid_scan_batch-read': {
                        table: 'sys_security_acl'
                        id: 'dbf329dbdf724fd88da3210441a47560'
                    }
                    'x_snc_nowrfid_scan_batch-write': {
                        table: 'sys_security_acl'
                        id: 'c8fdacb4d10440b7891998c6c2d75144'
                    }
                    'x_snc_nowrfid_scan_item-create': {
                        table: 'sys_security_acl'
                        id: '0df6f07e5c574875b33687f54d595189'
                    }
                    'x_snc_nowrfid_scan_item-delete': {
                        table: 'sys_security_acl'
                        id: '995bbe6a15a141f9bee62757a4bc4e3d'
                    }
                    'x_snc_nowrfid_scan_item-read': {
                        table: 'sys_security_acl'
                        id: 'b361b098abc9488dac0964cff933a9d7'
                    }
                    'x_snc_nowrfid_scan_item-write': {
                        table: 'sys_security_acl'
                        id: '88d546d2d9a94be181620af3a091ab91'
                    }
                    'x_snc_nowrfid_tag-create': {
                        table: 'sys_security_acl'
                        id: 'ffb26104bf444542a3758981beed3e7f'
                    }
                    'x_snc_nowrfid_tag-delete': {
                        table: 'sys_security_acl'
                        id: '1f8b438c61da4f6193279ca661285f24'
                    }
                    'x_snc_nowrfid_tag-read': {
                        table: 'sys_security_acl'
                        id: '45f9c340ed9443d5b5ca22e834ed08f8'
                    }
                    'x_snc_nowrfid_tag-write': {
                        table: 'sys_security_acl'
                        id: '389272f6b03443ceb8927e2b3789e1e1'
                    }
                }
                composite: [
                    {
                        table: 'sys_choice'
                        id: '015e49aa0fd84d20a462e3078d5428b4'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'status'
                            value: 'orphan'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '01c8803f5feb45ea94318cdb406f22a8'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'match_status'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '01cd003a882049a89feb03d3a0073ecf'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '01ea1b27c42b49ae9a91e274831fbcac'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'match_status'
                            value: 'matched'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '02700cedf3d24470aa9fe10c8290a083'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0310b001b4634e39aa8e2baf0e9e5c24'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'stockroom'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '03453cd13f8c4bf9a66e5f24abb50ec1'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '05772810432d4fc7877d4e690177d282'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'operation'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '068c5c4e69ac42a7a3dbe58914343cc9'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'captured_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0741f87cb56a4a7ebfb48fee452f3e38'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'asset_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_action_role'
                        id: '08f5c1e928374f24b6e48915d0e7642c'
                        key: {
                            sys_ui_action: '77db59e237a64350ae2a999f43693388'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '0b2e77abeb1c432db551faa90ac2d8a2'
                        key: {
                            sys_security_acl: '995bbe6a15a141f9bee62757a4bc4e3d'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0c8d3d7afa4242b0b199dbfd3d4ff7a6'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'classification_status'
                            value: 'ignored'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0ca63667fc4a409fb66c9c79f65c37a8'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'asset_class'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '0d6bee3e627440eeb5d1ee9e8f49418c'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '0e8d80b935674f51b7512abf2bc85e03'
                        key: {
                            sys_security_acl: 'c343b717294f4b688c67777b179d3a60'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0fb9a70c7b9a48b6822daf9ee6364754'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'location'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '10e632c4af1646eda582095f947187d0'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'source'
                            value: 'manual'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '1200ebd7b5ee44edac082f55e747a5e1'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'capture_type'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '1206be97f1b84beaaa30407fbf446513'
                        key: {
                            name: 'x_snc_nowrfid/main.js.map'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '13411a712b0a47eeb6761722b26fb865'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'client_batch_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '135ccd866e394032831a93e22d18c806'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '14a5c8bc9b7d4315a472d5fdb23fdd25'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '164fc54ccde7443aa9eec2fc07342746'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'operation'
                        }
                    },
                    {
                        table: 'sys_ui_action_role'
                        id: '18dd8c79c8ee4a4898a8470e343e0691'
                        key: {
                            sys_ui_action: '751615796deb42c4822c716e955ab7c3'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1944a5f1d10f4889bc59411a9c30e6f7'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'asset_class'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1d792056e19c48e794f6e6d2306af594'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'classification_status'
                            value: 'pending'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '1dd06200d8854450a1ce59065e37cc6b'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'operation'
                            value: 'write'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1dd3c0b987bf4621b1f5b21bd2456ab6'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'device_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1fa1efeb022f4cc493f44658ff9ce6a1'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'batch'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '1fc4cb7d7f054024bbe7800782d02446'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '1fdcb3c1f3aa4db7a67872e3dd48a2d8'
                        key: {
                            sys_security_acl: '389272f6b03443ceb8927e2b3789e1e1'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2020735bce3e40eba58117ccd99544ef'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'captured_at'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '22ee61ada2084d758a2409ffcd5cb9d8'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'model'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '252c74298dde4f419f52b99af5ca08f7'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'received_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2a6149c880a14c9b90646f395c10dd45'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_action_role'
                        id: '2bd322a7d9da40f38375482976721132'
                        key: {
                            sys_ui_action: 'e1c9fedfd3c34464bd2d9225a296764a'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2d57f015c4f442a4bf97642f57950157'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'epc'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2d66a3e282e04465b38e20ad3571b1a3'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'number'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2f06c47192b74168a0e4d8af265a47ec'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'source_item'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '3462e77831e040f0aac28da862348a15'
                        key: {
                            sys_security_acl: 'dbf329dbdf724fd88da3210441a47560'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '34c54e6f7cf9471e92ad3c9a5ea0c115'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'device_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '34d88ef057ba4bac846eec7e0ca21f91'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'client_item_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3882e55c526c489a91c0d0edc585d184'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'written_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '3c9c1a0f98544859bc6eb357fad64bd1'
                        key: {
                            logical_table_name: 'x_snc_nowrfid_tag'
                            col_name_string: 'epc'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3d6c17f565ae44d6b6bc3ae5477ced19'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'status'
                            value: 'active'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3edd0123681d414caf2597eebc3f85ee'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3fb231f48b774973bb27e7146ce3bb2a'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3fd0c35855b64645a5b37622dc8cddb8'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'classification_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '405e2e0ceada46e0b7008f6439c0a2a8'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '40b9029cf3f7458f9999ad9d20306532'
                        key: {
                            endpoint: 'x_snc_nowrfid_painel.do'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '413ef467181743da9a8cd044c9c7aa5d'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'model_category'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4269dab1bdaf4d2ab4faabf9ef3b9c72'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'read_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '445d448aad4646d7b3aec84ec2b961cf'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'status'
                            value: 'processing'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '45178c053ef443888b125cee81f15a4b'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'captured_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '480b181958744ad69083d8d62f6634d6'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'client_item_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4932f0bdbde9407c95e6dd369270006d'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'notes'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4afb62fe4f4e4e8790de33fee7ee9a2b'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4b6187351c154d25b3e7881c48e194a7'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'barcode_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4d6c0bf7476e4584807183a8c6e596b8'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'epc'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '4d8a50c4d0dd4175b5ff7fd95c044dc9'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'operation'
                            value: 'read'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4df6b504003e4e0aab1ea1f4fd3a26ce'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '50c0d81805fe469dabddec176135b0a2'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'reader_mac'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '51685d2b1ab44c948bf8373fe2e33570'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '524b255f58d746f0a89f8a82e4908bdd'
                        key: {
                            sys_security_acl: 'ae6f63e12e7a4fa8b7f75748a26346c0'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '5503af5ede8644e292b0d8da17fad3e4'
                        key: {
                            logical_table_name: 'x_snc_nowrfid_counter'
                            col_name_string: 'name'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5530287461564688968d80cf360fb0bf'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'classification_status'
                            value: 'classified'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '55f0dc5a213a4b4a9ef02e697089e795'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '57c614912584418195bd58b82fb81c41'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '582295e5c272456d93b74ca14dd86597'
                        key: {
                            name: 'x_snc_nowrfid.admin'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5a658aabc0ae4fbdaa3a08510d5bb544'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '5aa6b8a3b99c41b199480f9d305efc72'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'classification_status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5d658c8a36ac4d5e86d432950e7e169e'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'digits'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5d6ccbf4cb1645ff8066d180ebd6a9a9'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'status'
                            value: 'new'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5def42e210954936811ed8fca871a91b'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'asset_tag'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5fb40c790d4143639982f464b5e114af'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'model'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '612a79c0ee064d0e833690923a67754f'
                        key: {
                            sys_security_acl: '0bdd00fa17a245d9ba8c029e4935b34f'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '61e23d815efe4c73b9bea39474b51033'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '61f223ff385549e4beddf201825020c7'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '6218853f6dff415d8883d8492d6b7b88'
                        key: {
                            sys_security_acl: 'c8fdacb4d10440b7891998c6c2d75144'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '62588da505254b0db56c7b1093e523c0'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'item_count'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6345055c93f04fc8bf0bc4e128588c60'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'status'
                            value: 'replaced'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6346d07005c74c7288da44b983efa827'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'digits'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '65137876ba7b43a1967d85447d613afc'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'match_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '65f8a15e5bd04375bdda83c00bc22a56'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'capture_type'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '67e42380d4b046f4974fab56134d4d83'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'capture_type'
                            value: 'rfid'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '694fb8c2946c4542adca24edfe771c67'
                        key: {
                            sys_security_acl: '89f71255899c45f8ba0d7057a5655a25'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6af54fed759847aaafa986f0ef70e7de'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'asset_type'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6d85aa07f1804171baae71c245d0039f'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'app_version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6f03373232d4489897a1f26a0ea3cd7a'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'written_at'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '6f28bb4b7fb94df0aae68d59f718d8e9'
                        key: {
                            sys_security_acl: '59982d72fb704701893c34584b0fb542'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '71388770fad047fd91f5d2e19c0cd64e'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'icon'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '72c5f2526a674d6c9ebf548fdcd8aeb5'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '731f374ea1d44d168d0fb319de2bd6bb'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'asset'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '73afa4d7686c4efebb7fe1e347d5a057'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'epc'
                        }
                    },
                    {
                        table: 'sys_user_role_contains'
                        id: '73f151f97af24f36878c92692f99972c'
                        key: {
                            role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                            contains: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '74ec955faeb448838c1d1a24592ee969'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'operator'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '77aab02211654892a8c59924a9107478'
                        key: {
                            sys_security_acl: '0df6f07e5c574875b33687f54d595189'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '77bc5a298c2c4b51bd820d1d47511458'
                        key: {
                            sys_security_acl: '1f8b438c61da4f6193279ca661285f24'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '794cc1cbdead4689ba8eeb1597adbb21'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7b391000b4ac4a788c9b39c084892ac7'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'matched_asset'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '7b92bdb0c3214eaca4422f2ce3012f2d'
                        key: {
                            sys_security_acl: '28563bba0915442a9f3a3c01cda03722'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7f400e059ae04c6f9de207e03282be50'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'number'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '81cafaf6a59c44a0ad047abff73b8996'
                        key: {
                            sys_security_acl: '03b6c2e721c042c7afa4805752981f2a'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '84591707192c4071b85cc9167f9db593'
                        key: {
                            sys_security_acl: 'b361b098abc9488dac0964cff933a9d7'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '853a0b214c184077bf6109bed6d5b618'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'raw_payload'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '868def7320814cb4a3f1a1d96d0586e4'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'reader_mac'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '86b83d3acc294a58862fe886332c30cc'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'user_data'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '87835d45460c47c99c9b18e83200f460'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'source_item'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '88c2b92a78b44eb890cf4f6641aeafd0'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'epc'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '897b65cc801e4ec0b00be7abc4de76e7'
                        key: {
                            sys_security_acl: 'a2697464f1fd4e32a46bd78c90a17e46'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '8e586c7e83a74024ac2ea7812b92527e'
                        key: {
                            application_file: '40b9029cf3f7458f9999ad9d20306532'
                            source_artifact: 'f6abcce6ea20413a9cd32f0c400f575d'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8f3541f1f06e4ecfafa8befb708d084a'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'captured_at'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8ffd92d185b9434587e9fb8e60aaac01'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'next_value'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9058e37d716f41fbac2d86d51db3d144'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'promoted_asset'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '915c19c965da4682835b1aa648665ca7'
                        key: {
                            sys_security_acl: '686c2c3557034e97807568ed6296e111'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9649df1ea7944a98a6bfaa407636a034'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'asset'
                        }
                    },
                    {
                        table: 'sys_ui_action_role'
                        id: '967fdd5daff44830918a1360b47ff274'
                        key: {
                            sys_ui_action: '537e47091b1e47e6b93a9f6bc1a49e47'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '971bd26ea87947e4907569e985687b08'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'result_message'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '971f6b349d7b4138a1ec75889d2116ea'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'match_status'
                            value: 'existing'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '97e8959359854b56939613365b87be07'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'tid'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '98e64aaeddfb4e72921d1b8d0d7df96d'
                        key: {
                            application_file: 'd2bbb4bba1c34250ac22ed3e7f5d8930'
                            source_artifact: 'f6abcce6ea20413a9cd32f0c400f575d'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9a135b9ceae74275907153664d37796d'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'capture_type'
                            value: 'qr'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9af4de0930624065ad8aebb62949ff20'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'tid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '9c6aae7b2bc240909c6eb6a5645fe34e'
                        key: {
                            sys_security_acl: 'ffb26104bf444542a3758981beed3e7f'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9d82b91b1025495daa7982d1e7f5f55c'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'read_count'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9db10c9b117649d2800de6eb5d2c7d28'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'location'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '9dbad70082334c34bcb59ac68ae6ab8f'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'match_status'
                            value: 'created'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9e0cd4dd0acc48a9b6f9acbc33647151'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'location'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '9f996fdc58504474a7eb4f886b623816'
                        key: {
                            sys_security_acl: '0df6f07e5c574875b33687f54d595189'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'a0636414662241478f10a9aded689fee'
                        key: {
                            logical_table_name: 'x_snc_nowrfid_scan_item'
                            col_name_string: 'epc'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a07ad0c8aa8348b48315a2a03d632ae5'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'tid'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a100c7d9cfa44d37bee3193c3b8837ff'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'barcode_value'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a46833c13b1c443a9d689c7fb51cd05f'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'rssi'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'a4acae819df14d88800b28289747663d'
                        key: {
                            name: 'x_snc_nowrfid.integration'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'a5ddb47a50fb43f1b2215a3c43cad5aa'
                        key: {
                            sys_security_acl: '89f71255899c45f8ba0d7057a5655a25'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a63d055aa4cd409aaeae0cc6910213ec'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'asset_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'a6a4eda1ac2045d290c1ce22899b36ce'
                        key: {
                            sys_security_acl: '45f9c340ed9443d5b5ca22e834ed08f8'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a6c3aa830db3424ea14da4dfe263c24d'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'asset_tag'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a85c3864f64b404fbb922cf449171606'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a93688625abf426da52c0deed1f599ca'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'app_version'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a95a5b3297c747e5bd38b7bb051d26ec'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'a99e1bfcd55a4c7f916a0093781a2a45'
                        key: {
                            sys_security_acl: 'b361b098abc9488dac0964cff933a9d7'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'acf7ad7af894451fa455c5fbd6356819'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'operator'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ae413b9fed0e43a089e597f9428f876c'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'order'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ae6b68dc87a44e9c8a1d8db1dd281b0d'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'status'
                            value: 'killed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b038ac334cd149dfa8715872c6068374'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'promoted_asset'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b060c549c94340fcbff49b3edc18b1d2'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b134bc69319f411ba6ee904d8b7c308e'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'symbology'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b167bcc91c01491e9e0df374b72d455e'
                        key: {
                            sys_security_acl: 'ffb26104bf444542a3758981beed3e7f'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b3f5c0e0c13643c1939f59b9adfa1cd5'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'capture_type'
                            value: 'barcode'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b42e6da767f344d1add3237aaa9b5815'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b4735467532f4ba19dbb8e28a2610c09'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'matched_asset'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b5c31a7e3e4a40a680ce51a5750fa6fb'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'location'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b6fc39b5604548888f13848556b745eb'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'location'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'baf59142b01b44978f851a755a17601d'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'bbb3cf8f372e49bf8e9955deecb04a5c'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'status'
                            value: 'processed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bbfa550fc02f4ac38cdc81b901dd8fd8'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bc4764e99e9c428fa7e5d7cefb9b8846'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'default_model'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bda3df9463184748a320ddc13212bd93'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'raw_payload'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c098e9b74b374aef8a3f4e8d49b2a6e7'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'default_model'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'c1a00c387dc84b07b992e5389b2e2fa5'
                        key: {
                            sys_security_acl: '88d546d2d9a94be181620af3a091ab91'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c2cd5adcf57c4608a6aff1f13f41c9da'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'location'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c3d9326146e5477a8876cd54e294ff47'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c5351a7d39aa47e0bad06139b2e8a384'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'order'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c5897bf411b74de09ee61ab1b312840f'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'result_message'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'c59e527ec0fa4377870db537b49b0422'
                        key: {
                            logical_table_name: 'x_snc_nowrfid_tag'
                            col_name_string: 'tid'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c6880abc56494ce8afd9e45aee47c7a7'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'department'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c78c333642394153bea3ea4fbde0127c'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'siaf'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: 'c82fe6bbe3d3443f9f1b5b019ec096b7'
                        key: {
                            category: 'x_snc_nowrfid_scan_batch'
                            prefix: 'RFB'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c9a35fb6b49743e0a5be53b9a3264d15'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'classification_status'
                            value: 'promoted'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'cb04fed8a20441ee8ced46a189232915'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'cc31ea94e6c64ad1afdc4674a9b05752'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'match_status'
                            value: 'unmatched'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cf5b3ef052b8424e9f6a4bd3da73d703'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'classification_status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cf6ce77e79734556b1f3fb31203d673e'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'symbology'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd148413fef034020a8e1a840d420c9e9'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'capture_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd19db53a393a40188ec0b666488b6d5d'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'department'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd27e3cd9cc254ec4b94508bcb51a629b'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'stockroom'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'd2bbb4bba1c34250ac22ed3e7f5d8930'
                        key: {
                            name: 'x_snc_nowrfid/main'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'd3a249c5ea1444d89e1b7d1a2a044be8'
                        key: {
                            sys_security_acl: 'f3e6d020f500439a918352672b50fc8d'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'd3cfa57b17e9409699c35b082cd34b05'
                        key: {
                            sys_security_acl: '45f9c340ed9443d5b5ca22e834ed08f8'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd7ae86bcee424f9491d870cc493866d4'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'user_data'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd81b19d2eea84b36bd2109267471e6e8'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'item_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd878c1bf8f6948b7ba38b17cd079308d'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'source'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd94b0ff0598448aaa2187fc2740b1dd4'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'asset_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd96379b70ba94534b3e70a4d7a8aadb4'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'received_at'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd9928d58182e49f19ddb9de5c285b245'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'tid'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'da5511fac40744efbb538f0f079375a7'
                        key: {
                            sys_security_acl: '7decff96420e4035a47802af83a8849d'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'db1f1fd64ce24f3e89b7958d46cdd59c'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dc5e1252a198453ab06f61cbf14ced78'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'siaf'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dcbe2e7a4b124680b17cb7457f7fbfde'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'match_status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'df26c5fca15c4565aa022e22fa3d0a19'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'df2cba1310b84fe7bc1a9c92cb1b63d9'
                        key: {
                            name: 'x_snc_nowrfid_counter'
                            element: 'next_value'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e066f9ec1d47466d896c89bed22052d0'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'e094cd06783f4b1a9c61e2f376aee410'
                        key: {
                            application_file: '1206be97f1b84beaaa30407fbf446513'
                            source_artifact: 'f6abcce6ea20413a9cd32f0c400f575d'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'e39407aeeea2494ebec5d8669732fe27'
                        key: {
                            logical_table_name: 'x_snc_nowrfid_scan_item'
                            col_name_string: 'barcode_value'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e4e569371a1e43ae9945059711c2a358'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'status'
                            value: 'error'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e4ebc9a5f156490babf4f1969c7d7d37'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'asset_type'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'e554360e3738411fbd0b7a4b1a75c8d3'
                        key: {
                            logical_table_name: 'x_snc_nowrfid_scan_item'
                            col_name_string: 'classification_status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e8152e21620240ffb748a69b53867119'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'source'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e9dc98163dfc4dc9b3f1110a9db913a5'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'eac69a3b42b547c9b51c092fe2c056cc'
                        key: {
                            logical_table_name: 'x_snc_nowrfid_scan_batch'
                            col_name_string: 'client_batch_id'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'eb863a18fa924e6ca269068cd9dc726e'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'rssi'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'ebe1e10bbbc048f9ad34472844299ffd'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'eec28786bc5b4696ac3df4484c6be9d5'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'operation'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'f0e23883cda84c7bb2631b8509b997cd'
                        key: {
                            sys_security_acl: 'dbf329dbdf724fd88da3210441a47560'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'f14653b18f9a4dcc8b1fea78989d1c9c'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f15178839eda4de7b7003bfe1dfcb2bc'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'source'
                            value: 'app'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'f45db6eae3634d2ebb74d9f09a741b82'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'source'
                            value: 'category'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'f6abcce6ea20413a9cd32f0c400f575d'
                        key: {
                            name: 'x_snc_nowrfid_painel.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'f6c1672f9de44b47ae3af95a20f54379'
                        key: {
                            sys_security_acl: 'ae6f63e12e7a4fa8b7f75748a26346c0'
                            sys_user_role: {
                                id: '582295e5c272456d93b74ca14dd86597'
                                key: {
                                    name: 'x_snc_nowrfid.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f8a73d47bd3f4c2da08782f3df79b311'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fa1b93fe792f40b7a3732ca439eab55f'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'source'
                            value: 'system'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'faa76148ec0b4b6bb3a67ad88df0b5c5'
                        key: {
                            name: 'x_snc_nowrfid_tag'
                            element: 'asset_type'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'fb3fa12908e041cfbadfb35b803dc4ad'
                        key: {
                            sys_security_acl: 'a2697464f1fd4e32a46bd78c90a17e46'
                            sys_user_role: {
                                id: 'a4acae819df14d88800b28289747663d'
                                key: {
                                    name: 'x_snc_nowrfid.integration'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fc203d0733934cda8801eef0fceb5c47'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'client_batch_id'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'fc9439d831d643a3b7abc45a1bf53175'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'icon'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'fdc93abf7e5a44b2a656afece0cbf562'
                        key: {
                            name: 'x_snc_nowrfid_scan_item'
                            element: 'batch'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ff13c064244d403fa93f91e0f77c3c21'
                        key: {
                            name: 'x_snc_nowrfid_scan_batch'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ff27f4314ef247928ca4e4a924026a5a'
                        key: {
                            name: 'x_snc_nowrfid_asset_type'
                            element: 'model_category'
                            language: 'en'
                        }
                    },
                ]
            }
        }
    }
}
